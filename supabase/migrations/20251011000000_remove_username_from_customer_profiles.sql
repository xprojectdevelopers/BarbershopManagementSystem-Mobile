-- Remove username column and related policy
ALTER TABLE customer_profiles DROP COLUMN username;
DROP POLICY "Allow username availability checks" ON customer_profiles;
