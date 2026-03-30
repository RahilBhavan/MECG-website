-- Private bucket for applicant headshots; paths are `{user_id}/headshot.{ext}`

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'application-headshots',
  'application-headshots',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Applicant: read/write/delete only under own user id folder
DROP POLICY IF EXISTS "application_headshots_owner_select" ON storage.objects;
DROP POLICY IF EXISTS "application_headshots_owner_insert" ON storage.objects;
DROP POLICY IF EXISTS "application_headshots_owner_update" ON storage.objects;
DROP POLICY IF EXISTS "application_headshots_owner_delete" ON storage.objects;
DROP POLICY IF EXISTS "application_headshots_reviewer_select" ON storage.objects;
DROP POLICY IF EXISTS "application_headshots_admin_select" ON storage.objects;

CREATE POLICY "application_headshots_owner_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'application-headshots'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY "application_headshots_owner_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'application-headshots'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY "application_headshots_owner_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'application-headshots'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'application-headshots'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY "application_headshots_owner_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'application-headshots'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- Reviewers: read headshots for applicants with submitted / under_review applications
CREATE POLICY "application_headshots_reviewer_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'application-headshots'
    AND public.has_role((SELECT auth.uid()), 'reviewer')
    AND EXISTS (
      SELECT 1
      FROM public.applications a
      WHERE a.user_id::text = (storage.foldername(name))[1]
        AND a.status IN ('submitted', 'under_review')
    )
  );

-- Admins: read any object in this bucket
CREATE POLICY "application_headshots_admin_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'application-headshots'
    AND public.is_admin((SELECT auth.uid()))
  );
