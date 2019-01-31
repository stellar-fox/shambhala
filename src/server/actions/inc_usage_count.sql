-- transaction signing


-- increment server secret key usage counter
UPDATE $<key_table:name>
SET
    usage_count = usage_count + 1,
    last_usage = now()
WHERE
    g_public = $<G_PUBLIC> AND
    c_uuid = $<C_UUID>;
