-- Alumni directory: profile fields, per-field visibility, masked directory RPC,
-- network events + RSVPs, tightened profiles SELECT (alumni peers only via RPC).

-- ---------------------------------------------------------------------------
-- profiles: interests, graduation year, coffee chats, LinkedIn-style visibility
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS interests text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS graduation_year smallint,
  ADD COLUMN IF NOT EXISTS open_to_coffee_chats boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_linkedin boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_interests boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_cohort boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_industry boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_interests ON public.profiles USING GIN (interests);

-- ---------------------------------------------------------------------------
-- Tighten profiles SELECT: alumni no longer read peer rows directly (use RPC).
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_own_or_directory" ON public.profiles;

CREATE POLICY "profiles_select_own_or_admin"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR public.is_admin((SELECT auth.uid()))
  );

-- ---------------------------------------------------------------------------
-- Masked directory listing (SECURITY DEFINER — applies column masking)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.list_directory_profiles(
  p_q text DEFAULT NULL,
  p_cohort_substr text DEFAULT NULL,
  p_interest text DEFAULT NULL,
  p_graduation_year smallint DEFAULT NULL,
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  display_name text,
  cohort text,
  industry text,
  interests text[],
  graduation_year smallint,
  linkedin_url text,
  open_to_mentoring boolean,
  open_to_coffee_chats boolean,
  directory_visible boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_admin boolean;
  v_lim int;
  v_off int;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = '42501';
  END IF;

  v_admin := public.is_admin(v_uid);
  IF NOT v_admin AND NOT public.has_role(v_uid, 'alumni') THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  v_lim := COALESCE(NULLIF(p_limit, 0), 50);
  IF v_lim < 1 THEN v_lim := 1; END IF;
  IF v_lim > 100 THEN v_lim := 100; END IF;

  v_off := COALESCE(p_offset, 0);
  IF v_off < 0 THEN v_off := 0; END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.display_name,
    CASE
      WHEN v_admin THEN p.cohort
      WHEN p.directory_visible AND p.show_cohort THEN p.cohort
      ELSE NULL
    END AS cohort,
    CASE
      WHEN v_admin THEN p.industry
      WHEN p.directory_visible AND p.show_industry THEN p.industry
      ELSE NULL
    END AS industry,
    CASE
      WHEN v_admin THEN p.interests
      WHEN p.directory_visible AND p.show_interests THEN p.interests
      ELSE NULL
    END AS interests,
    CASE
      WHEN v_admin THEN p.graduation_year
      WHEN p.directory_visible AND p.show_cohort THEN p.graduation_year
      ELSE NULL
    END AS graduation_year,
    CASE
      WHEN v_admin THEN p.linkedin_url
      WHEN p.directory_visible AND p.show_linkedin THEN p.linkedin_url
      ELSE NULL
    END AS linkedin_url,
    CASE
      WHEN v_admin THEN p.open_to_mentoring
      WHEN p.directory_visible THEN p.open_to_mentoring
      ELSE false
    END AS open_to_mentoring,
    CASE
      WHEN v_admin THEN p.open_to_coffee_chats
      WHEN p.directory_visible THEN p.open_to_coffee_chats
      ELSE false
    END AS open_to_coffee_chats,
    p.directory_visible
  FROM public.profiles p
  WHERE
    (
      v_admin
      OR (p.directory_visible = true AND p.id <> v_uid)
    )
    AND (
      p_q IS NULL
      OR btrim(p_q) = ''
      OR p.display_name ILIKE '%' || btrim(p_q) || '%'
      OR p.cohort ILIKE '%' || btrim(p_q) || '%'
      OR p.industry ILIKE '%' || btrim(p_q) || '%'
      OR EXISTS (
        SELECT 1
        FROM unnest(p.interests) AS t(tag)
        WHERE t.tag ILIKE '%' || btrim(p_q) || '%'
      )
    )
    AND (
      p_cohort_substr IS NULL
      OR btrim(p_cohort_substr) = ''
      OR p.cohort ILIKE '%' || btrim(p_cohort_substr) || '%'
    )
    AND (
      p_interest IS NULL
      OR btrim(p_interest) = ''
      OR EXISTS (
        SELECT 1
        FROM unnest(p.interests) AS t(tag)
        WHERE tag ILIKE '%' || btrim(p_interest) || '%'
      )
    )
    AND (
      p_graduation_year IS NULL
      OR p.graduation_year = p_graduation_year
    )
  ORDER BY lower(p.display_name) NULLS LAST, p.id
  LIMIT v_lim
  OFFSET v_off;
END;
$$;

REVOKE ALL ON FUNCTION public.list_directory_profiles(text, text, text, smallint, int, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_directory_profiles(text, text, text, smallint, int, int) TO authenticated;

-- ---------------------------------------------------------------------------
-- RSVP going-count for capacity (alumni + admin only)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.network_event_going_count(p_event_id uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN 0;
  END IF;
  IF NOT (
    public.has_role(auth.uid(), 'alumni')
    OR public.is_admin(auth.uid())
  ) THEN
    RETURN 0;
  END IF;
  RETURN (
    SELECT count(*)::int
    FROM public.network_event_rsvps r
    WHERE r.event_id = p_event_id
      AND r.status = 'going'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.network_event_going_count(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.network_event_going_count(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- network_events & network_event_rsvps
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.network_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text,
  kind text NOT NULL CHECK (kind IN ('event', 'office_hours')),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  location text,
  meet_link text,
  capacity int CHECK (capacity IS NULL OR capacity > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.network_event_rsvps (
  event_id uuid NOT NULL REFERENCES public.network_events (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('going', 'waitlist', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_network_events_starts ON public.network_events (starts_at);
CREATE INDEX IF NOT EXISTS idx_network_event_rsvps_user ON public.network_event_rsvps (user_id);

DROP TRIGGER IF EXISTS network_event_rsvps_updated_at ON public.network_event_rsvps;
CREATE TRIGGER network_event_rsvps_updated_at
  BEFORE UPDATE ON public.network_event_rsvps
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.network_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_event_rsvps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "network_events_select_alumni_admin" ON public.network_events;
CREATE POLICY "network_events_select_alumni_admin"
  ON public.network_events FOR SELECT
  TO authenticated
  USING (
    public.is_admin((SELECT auth.uid()))
    OR public.has_role((SELECT auth.uid()), 'alumni')
  );

DROP POLICY IF EXISTS "network_events_insert_admin" ON public.network_events;
CREATE POLICY "network_events_insert_admin"
  ON public.network_events FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "network_events_update_admin" ON public.network_events;
CREATE POLICY "network_events_update_admin"
  ON public.network_events FOR UPDATE
  TO authenticated
  USING (public.is_admin((SELECT auth.uid())))
  WITH CHECK (public.is_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "network_events_delete_admin" ON public.network_events;
CREATE POLICY "network_events_delete_admin"
  ON public.network_events FOR DELETE
  TO authenticated
  USING (public.is_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "network_event_rsvps_select_own_or_admin" ON public.network_event_rsvps;
CREATE POLICY "network_event_rsvps_select_own_or_admin"
  ON public.network_event_rsvps FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR public.is_admin((SELECT auth.uid()))
  );

DROP POLICY IF EXISTS "network_event_rsvps_insert_own" ON public.network_event_rsvps;
CREATE POLICY "network_event_rsvps_insert_own"
  ON public.network_event_rsvps FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND (
      public.has_role((SELECT auth.uid()), 'alumni')
      OR public.is_admin((SELECT auth.uid()))
    )
  );

DROP POLICY IF EXISTS "network_event_rsvps_update_own" ON public.network_event_rsvps;
CREATE POLICY "network_event_rsvps_update_own"
  ON public.network_event_rsvps FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "network_event_rsvps_delete_own" ON public.network_event_rsvps;
CREATE POLICY "network_event_rsvps_delete_own"
  ON public.network_event_rsvps FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));
