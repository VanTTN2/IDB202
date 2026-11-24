/* IDB201 Lab 5: large tables for the indexing and concurrency experiments.
   student_big: 200,000 rows; takes_big: about 2,000,000 rows; account: 10 rows.
   The data is synthetic and deterministic, so every student gets the same
   tables. Expect the script to run for about one minute. */
use University;
go
set nocount on;
drop table if exists takes_big;
drop table if exists student_big;
drop table if exists account;

create table student_big (
    ID        int         not null primary key,          -- clustered index
    name      varchar(20) not null,
    dept_name varchar(20) not null,
    tot_cred  int         not null,
    filler    char(200)   not null default ''            -- makes rows realistic in size
);

with d as (select n from (values (0),(1),(2),(3),(4),(5),(6),(7),(8),(9)) v(n)),
     nums as (select top (200000) row_number() over (order by (select null)) as k
              from d a, d b, d c, d e, d f, d g)
insert into student_big (ID, name, dept_name, tot_cred)
select k,
       'Student ' + cast(k as varchar(10)),
       'Dept ' + cast(k % 20 as varchar(2)),
       (k * 37) % 161                                       -- 0..160, near uniform
from nums;

create table takes_big (
    ID        int        not null,
    course_id varchar(8) not null,
    year      int        not null,
    grade     varchar(2) null,
    primary key (ID, course_id, year)                       -- clustered index
);

insert into takes_big (ID, course_id, year, grade)
select s.ID,
       'C-' + cast((s.ID * 13 + q.j * 101) % 500 as varchar(4)),
       2016 + (s.ID + q.j) % 10,
       case (s.ID + q.j) % 7 when 0 then 'A' when 1 then 'B' when 2 then 'C'
                             when 3 then 'D' when 4 then 'F' when 5 then 'B+' else null end
from   student_big s
cross join (values (1),(2),(3),(4),(5),(6),(7),(8),(9),(10)) q(j);

create table account (
    id      int primary key,
    owner   varchar(20) not null,
    branch  varchar(20) not null,
    balance numeric(10,2) not null check (balance >= 0)
);
insert into account values
 (1, 'An', 'Hanoi', 500), (2, 'Binh', 'Hanoi', 300), (3, 'Chau', 'Hue', 800),
 (4, 'Dung', 'Hue', 200), (5, 'Giang', 'Hanoi', 1000), (6, 'Ha', 'Danang', 650),
 (7, 'Khanh', 'Danang', 120), (8, 'Lan', 'Hanoi', 90), (9, 'Minh', 'Hue', 400),
 (10, 'Nam', 'Danang', 750);

update statistics student_big with fullscan;
update statistics takes_big with fullscan;
select (select count(*) from student_big) as student_big_rows,
       (select count(*) from takes_big)   as takes_big_rows;
go
