/* IDB201 Lab 3, Investigate part: test data of adjustable size.
   Creates stu_x(ID, tot_cred) with @n students and takes_x with 10 rows per
   student (credits 2-4, about 10% failing grades and 10% null grades).
   Run it with @n = 1000, 10000 and 100000. */
use University;
go
set nocount on;
declare @n int = 10000;          -- change the size here

drop table if exists takes_x;
drop table if exists stu_x;
create table stu_x (
    ID       int primary key,
    tot_cred int not null default 0
);
create table takes_x (
    ID      int not null references stu_x (ID),
    seq     int not null,
    credits int not null,
    grade   varchar(2) null,
    primary key (ID, seq)
);

with digits as (select d from (values (0),(1),(2),(3),(4),(5),(6),(7),(8),(9)) v(d)),
     nums as (select top (@n) row_number() over (order by (select null)) as k
              from digits a, digits b, digits c, digits d, digits e, digits f)
insert into stu_x (ID) select k from nums;

insert into takes_x (ID, seq, credits, grade)
select s.ID, q.seq,
       2 + (s.ID + q.seq) % 3,
       case (s.ID * 7 + q.seq) % 10 when 0 then 'F' when 1 then null else 'B' end
from   stu_x s
cross join (values (1),(2),(3),(4),(5),(6),(7),(8),(9),(10)) q(seq);

select count(*) as students from stu_x;
select count(*) as takes_rows from takes_x;
go
