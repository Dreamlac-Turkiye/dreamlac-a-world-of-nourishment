CREATE OR REPLACE FUNCTION public.__apply_pending_migration(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
BEGIN
  EXECUTE sql;
END;
$fn$;

REVOKE ALL ON FUNCTION public.__apply_pending_migration(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.__apply_pending_migration(text) FROM anon, authenticated;
-- sandbox_exec only exists in the managed editor sandbox; no migration creates
-- it. Granting unconditionally aborts this migration on an independent project
-- and blocks every later one, including the REVOKEs that harden the trigger
-- functions.
DO $grant$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'sandbox_exec') THEN
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.__apply_pending_migration(text) TO sandbox_exec';
  END IF;
END;
$grant$;