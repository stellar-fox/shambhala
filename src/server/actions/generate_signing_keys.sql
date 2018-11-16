-- signing keys generation


-- store S_PUBLIC and ENC_SKP in a row
-- with appropriate G_PUBLIC with C_UUID
UPDATE $<key_table:name>
SET
    enc_skp = $<ENC_SKP>,
    datum = jsonb_build_object(
        's_public', $<S_PUBLIC>
    )
WHERE
    g_public = $<G_PUBLIC> AND
    c_uuid = $<C_UUID>;
