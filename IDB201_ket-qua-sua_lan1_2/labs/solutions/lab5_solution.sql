/* IDB201 Lab 5 - sample solution (lecturer copy). Database: University, after lab5_large.sql.
   Part 1 runs in one query window. Part 2 needs two windows (session A and session B):
   the steps are numbered in time order; run each step in the window named in the comment.
   Values were observed on SQL Server 2022; logical reads may differ slightly on lab PCs. */
use University;
go
set statistics io on;
go

/* ---------------------------------------------------------------- Part 1 */
-- 1.1  no index on name: Clustered Index Scan, about 6,085 logical reads (every page of student_big)
select ID, dept_name from student_big where name = 'Student 123456';

-- 1.2  with an index on name: Index Seek + Key Lookup, about 6 logical reads
create index ix_student_big_name on student_big (name);
select ID, dept_name from student_big where name = 'Student 123456';

-- 1.3  selectivity experiment (Level 3)
create index ix_student_big_tot_cred on student_big (tot_cred);
select ID, name, dept_name from student_big where tot_cred between 0 and 0;   -- seek + lookup (1,242 rows)
select ID, name, dept_name from student_big where tot_cred between 0 and 2;   -- clustered index scan
select ID, name, dept_name from student_big where tot_cred between 0 and 5;   -- clustered index scan
select ID, name, dept_name from student_big where tot_cred between 0 and 10;  -- clustered index scan
select ID, name, dept_name from student_big where tot_cred between 0 and 40;  -- clustered index scan
-- forced index for k = 40: about 156,000 logical reads, far more than the scan
select ID, name, dept_name from student_big with (index(ix_student_big_tot_cred))
where  tot_cred between 0 and 40;

-- 1.4  join algorithms (Level 3)
select s.dept_name, count(*) from student_big s join takes_big t on t.ID = s.ID
where  t.grade = 'F' group by s.dept_name;                                   -- optimizer: hash match
select s.dept_name, count(*) from student_big s join takes_big t on t.ID = s.ID
where  t.grade = 'F' group by s.dept_name option (loop join);
select s.dept_name, count(*) from student_big s join takes_big t on t.ID = s.ID
where  t.grade = 'F' group by s.dept_name option (merge join);
select s.dept_name, count(*) from student_big s join takes_big t on t.ID = s.ID
where  t.grade = 'F' group by s.dept_name option (hash join);
-- small range: merge join on two short ranges of the clustered indexes
select s.dept_name, count(*) from student_big s join takes_big t on t.ID = s.ID
where  t.grade = 'F' and s.ID between 1 and 50 group by s.dept_name;

-- clean-up (optional)
drop index ix_student_big_name on student_big;
drop index ix_student_big_tot_cred on student_big;
go

/* ---------------------------------------------------------------- Part 2
   Reset the balances first if earlier runs changed them:
   update account set balance = 500 where id = 1; update account set balance = 800 where id = 3;
   delete from account where id > 10;                                                          */

-- 2.1 Dirty read (Level 1)
-- (1) A:  begin tran; update account set balance = balance - 100 where id = 1;
-- (2) B:  set transaction isolation level read uncommitted; select balance from account where id = 1;  -- 400
-- (3) A:  rollback;
-- (4) B:  set transaction isolation level read committed;
-- (5) A:  begin tran; update account set balance = balance - 100 where id = 1;
-- (6) B:  select balance from account where id = 1;        -- waits ...
-- (7) A:  rollback;                                        -- ... B now shows 500

-- 2.2(a) Non-repeatable read at read committed (Level 2)
-- (1) A:  set transaction isolation level read committed; begin tran; select balance from account where id = 3;  -- 800
-- (2) B:  update account set balance = balance + 1 where id = 3;                                                -- runs at once
-- (3) A:  select balance from account where id = 3; commit;                                                     -- 801
-- 2.2(b) The same at repeatable read: B's update in (2) waits until A commits; A reads 800 twice.
-- 2.2(c) Phantom at repeatable read
-- (1) A:  set transaction isolation level repeatable read; begin tran; select count(*) from account where branch = 'Hanoi';  -- 4
-- (2) B:  insert into account values (11, 'Oanh', 'Hanoi', 100);                                                         -- runs at once
-- (3) A:  select count(*) from account where branch = 'Hanoi'; commit;                                                   -- 5
-- 2.2(d) The same at serializable: B's insert waits (key-range lock) until A commits; A counts 4 twice.
--        Afterwards: delete from account where id = 11;

-- 2.3 Deadlock (Level 2)
-- (1) A:  begin tran; update account set balance = balance + 1 where id = 1;
-- (2) B:  begin tran; update account set balance = balance + 1 where id = 2;
-- (3) A:  update account set balance = balance + 1 where id = 2;     -- waits for B
-- (4) B:  update account set balance = balance + 1 where id = 1;     -- deadlock: one session gets error 1205
-- (5) the surviving session: rollback;   (wait-for graph at step 4: A -> B and B -> A)

-- 2.4 Investigate (Level 3): written in the report, see the solution handout.
--   2.1 at read uncommitted:  w_A(x1) r_B(x1) abort_A        -> dirty read; not recoverable if B commits
--   2.2(a):                   r_A(x3) w_B(x3) r_A(x3)       -> edges A->B and B->A: not conflict serializable
--   2.2(c):                   predicate read of A, insert by B of a matching tuple -> phantom (DSC 18.4)
