-- MECG multi-role app: profiles, roles, applications, reviews
-- Apply in Supabase SQL Editor or via CLI: supabase db push

-- Role enum-like check
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name text,
  cohort text,
  industry text,
  open_to_mentoring boolean NOT NULL DEFAULT false,
  linkedin_url text,
  directory_visible boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('applicant', 'alumni', 'reviewer', 'admin')),
  PRIMARY KEY (user_id, role)
);

CREATE TABLE IF NOT EXISTS public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'accepted', 'rejected')),
  batch_id text NOT NULL DEFAULT 'default',
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS public.application_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications (id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  verdict text NOT NULL CHECK (verdict IN ('pass', 'maybe', 'yes')),
  score int CHECK (score IS NULL OR (score >= 1 AND score <= 5)),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (application_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_batch ON public.applications (batch_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles (user_id);
CREATE INDEX IF NOT EXISTS idx_application_reviews_app ON public.application_reviews (application_id);

-- updated_at touch
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS applications_updated_at ON public.applications;
CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS application_reviews_updated_at ON public.application_reviews;
CREATE TRIGGER application_reviews_updated_at
  BEFORE UPDATE ON public.application_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Admin helper (fixed search_path for security)
CREATE OR REPLACE FUNCTION public.is_admin(check_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_uid AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.has_role(check_uid uuid, role_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_uid AND role = role_name
  );
$$;

-- New auth users: profile + default applicant role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'applicant');
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_reviews ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select_own_or_directory"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR public.is_admin((SELECT auth.uid()))
    OR (
      directory_visible = true
      AND public.has_role((SELECT auth.uid()), 'alumni')
    )
  );

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

-- user_roles
CREATE POLICY "user_roles_select_own_or_admin"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR public.is_admin((SELECT auth.uid()))
  );

CREATE POLICY "user_roles_admin_write"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin((SELECT auth.uid())));

CREATE POLICY "user_roles_admin_delete"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.is_admin((SELECT auth.uid())));

-- applications
CREATE POLICY "applications_select_own"
  ON public.applications FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR public.is_admin((SELECT auth.uid()))
    OR (
      status IN ('submitted', 'under_review')
      AND public.has_role((SELECT auth.uid()), 'reviewer')
    )
  );

CREATE POLICY "applications_insert_own"
  ON public.applications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Owners may update their application; reviewers/admins never update application rows (reviews live in application_reviews).
DROP POLICY IF EXISTS "applications_update_own_draft" ON public.applications;
DROP POLICY IF EXISTS "applications_update_own_submit" ON public.applications;
DROP POLICY IF EXISTS "applications_update_own" ON public.applications;

CREATE POLICY "applications_update_owner"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- application_reviews
CREATE POLICY "application_reviews_select_own"
  ON public.application_reviews FOR SELECT
  TO authenticated
  USING (
    reviewer_id = (SELECT auth.uid())
    OR public.is_admin((SELECT auth.uid()))
  );

CREATE POLICY "application_reviews_insert_reviewer"
  ON public.application_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    reviewer_id = (SELECT auth.uid())
    AND public.has_role((SELECT auth.uid()), 'reviewer')
    AND EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = application_id
        AND a.status IN ('submitted', 'under_review')
    )
  );

CREATE POLICY "application_reviews_update_own"
  ON public.application_reviews FOR UPDATE
  TO authenticated
  USING (reviewer_id = (SELECT auth.uid()))
  WITH CHECK (reviewer_id = (SELECT auth.uid()));

CREATE POLICY "application_reviews_delete_own"
  ON public.application_reviews FOR DELETE
  TO authenticated
  USING (reviewer_id = (SELECT auth.uid()));

-- Bootstrap first admin after you know your auth.users id (Dashboard → Authentication → Users):
-- insert into public.user_roles (user_id, role) values ('00000000-0000-0000-0000-000000000000', 'admin')
--   on conflict do nothing;
