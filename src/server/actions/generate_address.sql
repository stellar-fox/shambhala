-- address creation / association


-- add fresh G_PUBLIC with C_UUID
INSERT INTO $<key_table:name> (g_public, c_uuid)
VALUES ($<G_PUBLIC>, $<C_UUID>);
