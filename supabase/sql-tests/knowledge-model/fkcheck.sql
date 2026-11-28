-- Foreign keys with no index whose leading columns match (Supabase advisor 0001)
select c.conrelid::regclass as tbl, c.conname
from pg_constraint c
where c.contype = 'f' and c.connamespace = 'public'::regnamespace
  and not exists (
    select 1 from pg_index i
    where i.indrelid = c.conrelid
      and (i.indkey::int2[])[0:cardinality(c.conkey)-1] @> c.conkey
      and (i.indkey::int2[])[0:cardinality(c.conkey)-1] <@ c.conkey
  )
order by 1,2;
