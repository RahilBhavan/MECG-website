-- Reviewer intelligence: phases, rubric scores, cohort/tags/assignment, blind pass tracking, peer review read

-- ---------------------------------------------------------------------------
-- applications: cohort (denormalized at submit), tags, assignment
-- ---------------------------------------------------------------------------
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS cohort text,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS assigned_reviewer_id uuid REFERENCES auth.users (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_applications_assigned_reviewer
  ON public.applications (assigned_reviewer_id)
  WHERE assigned_reviewer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_applications_tags ON public.applications USING GIN (tags);

COMMENT ON COLUMN public.applications.cohort IS 'Copied from applicant profile at submit for reviewer filtering without extra profile RLS.';
COMMENT ON COLUMN public.applications.tags IS 'Admin-assigned labels for reviewer queue filters.';
COMMENT ON COLUMN public.applications.assigned_reviewer_id IS 'When set, only that reviewer (and admins) see this app in the review pool.';

-- ---------------------------------------------------------------------------
-- application_reviews: phases, rubric JSON, shortlist verdict
-- ---------------------------------------------------------------------------
ALTER TABLE public.application_reviews
  ADD COLUMN IF NOT EXISTS review_phase text NOT NULL DEFAULT 'screening',
  ADD COLUMN IF NOT EXISTS scores jsonb;

UPDATE public.application_reviews SET review_phase = 'screening' WHERE review_phase IS NULL;

ALTER TABLE public.application_reviews DROP CONSTRAINT IF EXISTS application_reviews_verdict_check;
ALTER TABLE public.application_reviews
  ADD CONSTRAINT application_reviews_verdict_check
  CHECK (verdict IN ('pass', 'maybe', 'yes', 'shortlist'));

ALTER TABLE public.application_reviews
  ADD CONSTRAINT application_reviews_review_phase_check
  CHECK (review_phase IN ('screening', 'final'));

ALTER TABLE public.application_reviews DROP CONSTRAINT IF EXISTS application_reviews_application_id_reviewer_id_key;

ALTER TABLE public.application_reviews
  ADD CONSTRAINT application_reviews_application_id_reviewer_id_review_phase_key
  UNIQUE (application_id, reviewer_id, review_phase);

CREATE INDEX IF NOT EXISTS idx_application_reviews_phase ON public.application_reviews (review_phase);

COMMENT ON COLUMN public.application_reviews.review_phase IS 'screening = first pass; final = committee-style second pass.';
COMMENT ON COLUMN public.application_reviews.scores IS 'Optional rubric dimensions, e.g. {"fit":4,"communication":3}.';

-- ---------------------------------------------------------------------------
-- Blind screening: persist first-pass completion per reviewer/app
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.review_blind_pass (
  application_id uuid NOT NULL REFERENCES public.applications (id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (application_id, reviewer_id)
);

ALTER TABLE public.review_blind_pass ENABLE ROW LEVEL SECURITY;

CREATE POLICY "review_blind_pass_select_own"
  ON public.review_blind_pass FOR SELECT
  TO authenticated
  USING (reviewer_id = (SELECT auth.uid()) OR public.is_admin((SELECT auth.uid())));

CREATE POLICY "review_blind_pass_insert_own"
  ON public.review_blind_pass FOR INSERT
  TO authenticated
  WITH CHECK (
    reviewer_id = (SELECT auth.uid())
    AND public.has_role((SELECT auth.uid()), 'reviewer')
  );

CREATE POLICY "review_blind_pass_delete_own"
  ON public.review_blind_pass FOR DELETE
  TO authenticated
  USING (reviewer_id = (SELECT auth.uid()));

-- ---------------------------------------------------------------------------
-- RLS: applications — reviewers respect assignment pool
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "applications_select_own" ON public.applications;

CREATE POLICY "applications_select_own"
  ON public.applications FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR public.is_admin((SELECT auth.uid()))
    OR (
      status IN ('submitted', 'under_review')
      AND public.has_role((SELECT auth.uid()), 'reviewer')
      AND (
        assigned_reviewer_id IS NULL
        OR assigned_reviewer_id = (SELECT auth.uid())
      )
    )
  );

CREATE POLICY "applications_update_admin_tags_assignment"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (public.is_admin((SELECT auth.uid())))
  WITH CHECK (public.is_admin((SELECT auth.uid())));

-- ---------------------------------------------------------------------------
-- RLS: application_reviews — peers can read reviews for eligible applications
-- ---------------------------------------------------------------------------
CREATE POLICY "application_reviews_select_peer"
  ON public.application_reviews FOR SELECT
  TO authenticated
  USING (
    public.has_role((SELECT auth.uid()), 'reviewer')
    AND EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = application_id
        AND a.status IN ('submitted', 'under_review')
        AND (
          a.assigned_reviewer_id IS NULL
          OR a.assigned_reviewer_id = (SELECT auth.uid())
        )
    )
  );
