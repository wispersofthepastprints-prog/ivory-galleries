-- Apply only after signed-photo delivery is deployed and verified.
update storage.buckets
set public = false
where id = 'photos';

drop policy if exists "Public read access to photos" on storage.objects;
