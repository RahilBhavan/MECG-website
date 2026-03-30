-- Applicants may only update their application while it is still a draft, and may only
-- set status to draft or submitted (not decision states). Admins keep full UPDATE via
-- applications_update_admin_tags_assignment (reviewer_intelligence migration).

DROP POLICY IF EXISTS "applications_update_owner" ON public.applications;

CREATE POLICY "applications_applicant_draft_update"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    AND status = 'draft'
  )
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND status IN ('draft', 'submitted')
    AND (
      status <> 'submitted'
      OR submitted_at IS NOT NULL
    )
  );
