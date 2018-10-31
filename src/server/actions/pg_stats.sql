-- admin / misc


-- get list of opened postgresql sessions
SELECT datname, pid, usename
FROM pg_stat_activity;
