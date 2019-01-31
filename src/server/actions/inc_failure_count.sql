-- transaction signing


-- increment server secret key decryption failure counter
UPDATE $<key_table:name>
SET
    failure_count = failure_count + 1,
    last_failure = now()
WHERE
    g_public = $<G_PUBLIC> AND
    c_uuid = $<C_UUID>;
