-- transaction signing


-- get ENC_SKP for a given user
SELECT enc_skp AS "ENC_SKP"
FROM $<key_table:name>
WHERE
    g_public = $<G_PUBLIC> AND
    c_uuid = $<C_UUID>;
