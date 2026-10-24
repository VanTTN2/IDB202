// Builds the five IDB201 lab handouts (individual work, 10 points each).
// Usage: node materials/labs/build_labs.js [1 2 3 4 5]
// Every result and error quoted in the solution hints was checked on
// SQL Server 2022 with the scripts in materials/labs/sql.
const path = require("path");
const { P, H1, H2, H3, bullets, numbered, code, table, box, titleBlock, build } = require(path.join(__dirname, "..", "docx_common.js"));

const COMMON_SUBMIT = (n, extra = []) => [
  ...bullets([
    `One SQL script named \`IDB201_Lab${n}_<StudentID>.sql\`. Start it with a comment block giving your name, student ID and the date. Label every task with a comment, e.g. \`-- Task A1\`. The script must run from top to bottom on a freshly created database without errors, except for statements that a task asks you to make fail; mark those with \`-- expected error\`.`,
    `One mini-report named \`IDB201_Lab${n}_<StudentID>_report.pdf\` (at most 2 pages) for the Investigate part, with four headings: **Hypothesis**, **Method**, **Evidence** (tables or screenshots of results, plans or timings), **Conclusion** (with a reference to the textbook section that explains the result).`,
    ...extra,
    "Upload the files to the course LMS before the end of the lab session. Labs are individual work: you may discuss ideas, but the script and the report must be your own.",
  ]),
];

function rubric(rows) {
  const total = rows.reduce((a, r) => a + r[1], 0);
  return table([2.6, 0.8, 3.2, 3.2], ["Criterion", "Points", "Full marks", "Partial marks"],
    [...rows.map((r) => [r[0], String(r[1].toFixed(2).replace(/\.?0+$/, "")), r[2], r[3]]), ["**Total**", `**${total}**`, "", ""]], { shadeTotal: true });
}

function lab(o) {
  return [
    ...titleBlock(`Lab ${o.n}: ${o.title}`, o.subtitle, [
      ["Sessions", o.sessions], ["Mode", "Individual work, in the lab session"], ["Marks", "10 points. The five labs together count for 6% of the course grade (1.2% each)."],
      ["CLOs", o.clos], ["Textbook", o.reading], ["Files provided", o.files],
    ]),
    H1("1. Objectives"), ...bullets(o.objectives),
    H1("2. Learning outcomes"), P("After this lab you should be able to:"), ...bullets(o.outcomes),
    H1("3. Requirements"), ...o.requirements,
    H1("4. Guidance and hints"), ...o.hints,
    H1("5. Rubric"), P("The Investigate part counts for at least 40% of the lab mark, as stated in the Grading structure of the syllabus."), ...rubric(o.rubric),
    H1("6. Deliverables"), ...COMMON_SUBMIT(o.n, o.extraSubmit || []),
    H1("7. Brief solution hints (lecturer copy)"),
    ...box("Remove this section before giving the handout to students.", ["The hints below were checked on SQL Server 2022 with the provided scripts. Numbers such as logical reads or timings may differ slightly on other machines."]),
    ...o.solution,
  ];
}

// ------------------------------------------------------------------ Lab 1
const lab1 = lab({
  n: 1, title: "SQL queries, NULLs and equivalent formulations",
  subtitle: "Part 1: single-table queries, joins and NULL behaviour. Part 2: aggregation, subqueries, set operations and equivalent formulations.",
  sessions: "13 (part 1) and 14 (part 2)", clos: "CLO3, CLO4",
  reading: "DSC Ch. 3, §3.1–3.9, pp. 65–113; Exercises pp. 115–123",
  files: "`university_sqlserver.sql` (creates the database University: the university schema of DSC with course sample data)",
  objectives: [
    "Write single-table and multi-table SQL queries on the university schema.",
    "Observe how SQL treats null values: comparisons, `is null`, aggregate functions and outer joins.",
    "Use aggregation with `group by` and `having`, nested subqueries and set operations.",
    "Investigate whether different SQL formulations of the same English query really return the same result when nulls are present.",
  ],
  outcomes: [
    "write correct joins, outer joins, aggregate queries, set operations and nested subqueries for a given schema;",
    "predict the result of a query that involves null values using three-valued logic;",
    "express a 'for all' query (relational division) in SQL;",
    "test a hypothesis about query equivalence with a designed example and explain the result with the textbook.",
  ],
  requirements: [
    P("Run `university_sqlserver.sql` in SQL Server Management Studio (SSMS). It creates the database **University** with the relations classroom, department, course, instructor, section, teaches, student, takes, advisor, time_slot and prereq (DSC Fig. 2.9)."),
    H2("Part A – session 13 (3 points)"),
    ...numbered([
      "**A1 (0.5).** List the name, department and salary of every instructor who earns more than 80,000, highest salary first.",
      "**A2 (0.5).** For every section taught in Fall 2025, list course_id, sec_id, the course title and the name of the instructor.",
      "**A3 (0.5).** List every student with the course_id, semester and year of each course taken. Students who have taken no course must also appear.",
      "**A4 (0.5).** Find the instructors whose salary is unknown. Run `where salary = null` and `where salary is null` and explain in a comment why the results differ.",
      "**A5 (1.0).** In one query, return the number of rows of takes, the number of rows with a grade, and the number of rows whose grade is null. Explain in a comment the difference between `count(*)` and `count(grade)`.",
    ]),
    H2("Part B – session 14 (3 points)"),
    ...numbered([
      "**B1 (0.75).** For each department whose average instructor salary is greater than 70,000, give the department name and the average salary.",
      "**B2 (0.75).** For every department, give the number of students in it. Departments without students must appear with 0.",
      "**B3 (0.75).** Using set operations, list the courses offered in Fall 2025 or Spring 2026; in both semesters; in Fall 2025 but not Spring 2026.",
      "**B4 (0.75).** Find the students who have taken every course offered by the Mathematics department (relational division).",
    ]),
    H2("Investigate – sessions 13–14 (4 points)"),
    P("English query: _Find the instructors whose salary is greater than the salary of every instructor in the Biology department._"),
    ...numbered([
      "Before running anything, write a **hypothesis**: do the three formulations below return the same rows on the University database? Justify it in one or two sentences.",
      "Write the query in three ways: (F1) with `> all (subquery)`; (F2) with `> (select max(salary) …)`; (F3) with `not exists`.",
      "Run the three formulations and record the number of rows and the rows returned.",
      "Explain every difference you observe using three-valued logic and the treatment of nulls by aggregate functions. State which formulation matches the English query best, and why.",
      "Design a change to the data (one insert or update, then roll it back) under which all three formulations return the same rows. Show the evidence.",
    ]),
  ],
  hints: [
    ...bullets([
      "In SQL Server, `<>` and `!=` both mean 'not equal'; string literals use single quotes.",
      "A comparison with null yields _unknown_; a `where` clause keeps only rows for which the predicate is _true_ (DSC §3.6).",
      "Aggregate functions other than `count(*)` ignore null values (DSC §3.7.4).",
      "An outer join keeps unmatched tuples and pads them with nulls; use `count(<attribute of the right relation>)` to count matches (DSC §4.1.3).",
      "SQL Server has `union`, `intersect` and `except` (set versions). It does not support `intersect all` or `except all`.",
      "Division: 'student s has taken every Mathematics course' means there is no Mathematics course that s has not taken: `not exists (… except …)` (DSC §3.8.3).",
      "For the Investigate part, look at the instructors of Biology and their salaries before you write the hypothesis.",
      "Use `begin transaction … rollback transaction` so that the data change in step 5 does not affect the database.",
    ]),
  ],
  rubric: [
    ["Part A queries (A1–A5)", 3, "All queries correct; comments in A4 and A5 explain null semantics correctly", "0.5 per correct query in A1–A4, 1.0 for A5; half marks for a query with a minor error"],
    ["Part B queries (B1–B4)", 3, "All queries correct, including departments with 0 students and the division query", "0.75 per correct query; half marks for a minor error (e.g. inner instead of outer join in B2)"],
    ["Investigate: hypothesis", 0.5, "Clear, testable, stated before the experiment", "Vague or written after the results"],
    ["Investigate: three formulations", 1.5, "F1, F2, F3 correct and runnable", "0.5 per correct formulation"],
    ["Investigate: evidence", 1, "Row counts and rows for each formulation; data change of step 5 shown and rolled back", "Evidence incomplete or not reproducible"],
    ["Investigate: explanation", 1, "Differences explained with three-valued logic and aggregate semantics, citing DSC §3.6–3.8; best formulation argued", "Explanation partly correct or without reference"],
  ],
  solution: [
    H3("Part A and Part B"),
    ...bullets([
      "A1 returns 4 instructors (Curie, Nguyen, Pham, Bohr). A2 returns 6 rows (join section, course, teaches on all four section key attributes, and instructor).",
      "A3: `student left outer join takes on student.ID = takes.ID` returns 49 rows; S0004 and S0019 appear with nulls.",
      "A4: `salary = null` returns no rows because the comparison is unknown for every row; `salary is null` returns I9000 (Dang).",
      "A5: `select count(*), count(grade), count(*) - count(grade) from takes` gives 47, 39, 8.",
      "B1 returns Biology 72,000, Mathematics 74,500 and Physics 89,000. Biology's average ignores the null salary; Comp. Sci. (exactly 70,000) is not included.",
      "B2: `department left outer join student … group by d.dept_name` with `count(s.ID)`; Philosophy has 0.",
      "B3: union gives 10 courses, intersect gives CS-101, except gives BI-101, MA-101, MA-210, PH-101.",
      "B4: `where not exists (select course_id from course where dept_name = 'Mathematics' except select course_id from takes where takes.ID = s.ID)` returns S0005 (Giang).",
    ]),
    H3("Investigate"),
    ...code(
"-- F1: 0 rows\nselect name, salary from instructor\nwhere  salary > all (select salary from instructor where dept_name = 'Biology');\n-- F2: 6 rows (Nguyen, Tran, Pham, Curie, Bohr, Keynes)\nselect name, salary from instructor\nwhere  salary > (select max(salary) from instructor where dept_name = 'Biology');\n-- F3: 7 rows (the 6 above and Dang, whose salary is null)\nselect i.name, i.salary from instructor i\nwhere  not exists (select * from instructor b\n                   where b.dept_name = 'Biology' and b.salary >= i.salary);"),
    ...bullets([
      "F1: Biology contains a null salary, so `salary > null` is unknown for every instructor and `> all` is never true.",
      "F2: `max` ignores the null and returns 72,000.",
      "F3: for Dang, every comparison `b.salary >= null` is unknown, so the subquery is empty and `not exists` is true.",
      "With a null salary in Biology, the English query has no single 'correct' answer; F2 answers 'greater than every known Biology salary'. Setting I9000's salary to a value (e.g. 50,000) inside a rolled-back transaction makes all three return the same 6 rows.",
    ]),
  ],
});

// ------------------------------------------------------------------ Lab 2
const lab2 = lab({
  n: 2, title: "DDL, integrity constraints, views and parameterized queries",
  subtitle: "Define and test constraints, query through views, and examine SQL injection.",
  sessions: "19", clos: "CLO2, CLO4",
  reading: "DSC Ch. 4, §4.2, §4.4–4.5; Exercises pp. 176–179; §5.1 (prepared statements, SQL injection)",
  files: "`university_sqlserver.sql` (recreate the database before the lab)",
  objectives: [
    "Define tables with primary keys, foreign keys, unique, not null, check and default constraints.",
    "Observe how SQL Server enforces each constraint and how cascading actions propagate deletions.",
    "Create views, update through a view with check option, and see which views cannot be updated.",
    "Investigate SQL injection and show why parameterized queries prevent it.",
  ],
  outcomes: [
    "translate a short requirement into a table definition with appropriate constraints;",
    "predict and explain the error produced by an insert, update or delete that violates a constraint;",
    "decide whether a view is updatable and use `with check option`;",
    "demonstrate an injection attack on a concatenated query and remove it with `sp_executesql` parameters.",
  ],
  requirements: [
    P("Prepare before the session: recreate the database with `university_sqlserver.sql` and read DSC §4.4 and §5.1."),
    H2("Part A – constraints and views (6 points)"),
    ...numbered([
      "**A1 (2.0).** Student clubs: a club has an identifier generated by the system, a unique name, an optional sponsoring department, a founding date (default: today) and a maximum size between 5 and 200. A student can be a member of many clubs and a club has many members; each membership records the role (member, secretary or president; default member) and the date the student joined, which is required. Create the tables `club` and `membership`. When a student or a club is deleted, the memberships must disappear; when a department is deleted, the club remains without a sponsor.",
      "**A2 (1.5).** Insert one club and one membership. Then write five statements, each violating a different constraint: primary key, foreign key, check, unique and not null. Record the error number and explain each error in one comment line.",
      "**A3 (1.5).** Create a view `cs_students` of the Comp. Sci. students `with check option`, and a view `dept_size(dept_name, n)` giving the number of students per department. Insert one Physics student and one Comp. Sci. student through `cs_students`, and try to update `dept_size`. Explain each outcome, then delete the inserted student.",
      "**A4 (1.0).** Inside a transaction that you roll back, delete course CS-347 and show which rows of section and takes disappear. Then try to delete course CS-101 and explain the error by referring to the DDL of prereq.",
    ]),
    H2("Investigate – SQL injection (4 points)"),
    P("A web form lets a user type a student name; the application builds and runs this query:"),
    ...code("declare @name varchar(100) = '<text typed by the user>';\ndeclare @sql nvarchar(400) =\n    N'select ID, name from student where name = ''' + @name + N'''';\nexec (@sql);"),
    ...numbered([
      "Write a **hypothesis** about what a user can achieve by typing special characters into the form.",
      "Find an input that makes the query return every student, and an input containing an apostrophe (such as O'Brien) that makes it fail. Show the SQL text that is executed (`print @sql`).",
      "Rewrite the query with `sp_executesql` and a parameter. Run the same two inputs and record the results.",
      "Explain, with reference to DSC §5.1, why the parameterized version is safe while the concatenated one is not, and why escaping quotes by hand is a weaker defence.",
    ]),
  ],
  hints: [
    ...bullets([
      "`int identity(1,1) primary key` generates identifiers; `default (cast(sysdatetime() as date))` gives today's date.",
      "Name constraints (`constraint ck_role check (…)`) to make error messages easier to read.",
      "The error numbers to look for: 2627 (primary key or unique), 547 (foreign key or check), 515 (null into a not-null column).",
      "A view is updatable in SQL Server when the modification affects one base table and the columns are not computed (DSC §4.2.4 gives the standard conditions).",
      "Check the DDL of prereq at the top of `university_sqlserver.sql`: which foreign key has no cascading action, and why?",
      "In T-SQL a quote inside a string literal is written as two quotes: `'O''Brien'`.",
    ]),
  ],
  rubric: [
    ["A1 table definitions", 2, "All requirements expressed as constraints with the requested cascading actions and defaults", "Missing or wrong constraints: −0.25 each"],
    ["A2 constraint violations", 1.5, "Five violations, each with error number and correct explanation", "0.3 per correct violation"],
    ["A3 views", 1.5, "Both views correct; three outcomes explained", "0.5 per correct part"],
    ["A4 cascading deletes", 1, "Cascade shown and rolled back; error on CS-101 explained by the foreign key on prereq_id", "Only one of the two parts correct"],
    ["Investigate: hypothesis and attack", 1.5, "Testable hypothesis; both inputs found; executed SQL shown", "Only one input or no executed SQL"],
    ["Investigate: parameterized version", 1, "Correct `sp_executesql` call; both inputs handled as values", "Runs but still concatenates part of the input"],
    ["Investigate: explanation", 1.5, "Explains that parameters fix the query structure before the value is supplied; discusses escaping; cites DSC §5.1", "Correct but incomplete or without reference"],
  ],
  solution: [
    ...code(
"create table club (\n    club_id   int identity(1,1) primary key,\n    name      varchar(40) not null unique,\n    dept_name varchar(20) null references department (dept_name) on delete set null,\n    founded   date not null default (cast(sysdatetime() as date)),\n    max_size  int not null check (max_size between 5 and 200));\ncreate table membership (\n    ID      varchar(5)  not null references student (ID) on delete cascade,\n    club_id int         not null references club (club_id) on delete cascade,\n    role    varchar(10) not null default 'member'\n            check (role in ('member', 'secretary', 'president')),\n    joined  date        not null,\n    primary key (ID, club_id));"),
    ...bullets([
      "A2: duplicate (S0001, 1) → error 2627 (primary key); student S9999 → 547 (foreign key); role 'treasurer' → 547 (check); duplicate club name → 2627 (unique key); membership without `joined` → 515.",
      "A3: inserting a Physics student through `cs_students` fails with error 550 (check option); the Comp. Sci. student is inserted; updating `dept_size` fails with error 4406 (derived field).",
      "A4: deleting CS-347 cascades to its section, teaches and takes rows (0 left). Deleting CS-101 fails with error 547 because `prereq.prereq_id` references course without a cascading action (SQL Server rejects a second cascade path, error 1785).",
      "Investigate: the input `X' or '1'='1` produces `… where name = 'X' or '1'='1'` and returns all 20 students; `O'Brien` gives error 102 (incorrect syntax). With `exec sp_executesql N'select ID, name from student where name = @n', N'@n varchar(100)', @n = @name;` the first input returns 0 rows and the second runs without error.",
    ]),
  ],
});

// ------------------------------------------------------------------ Lab 3
const lab3 = lab({
  n: 3, title: "T-SQL functions, procedures, triggers and cursors",
  subtitle: "Part 1: user-defined functions and stored procedures with error handling. Part 2: triggers for business rules and audit logs; cursor versus set-based processing.",
  sessions: "24 (part 1) and 25 (part 2)", clos: "CLO2, CLO4, CLO8",
  reading: "DSC §5.2–5.3, pp. 198–212; T-SQL reference: CREATE FUNCTION, CREATE PROCEDURE, TRY…CATCH, CREATE TRIGGER, DECLARE CURSOR",
  files: "`university_sqlserver.sql`; `lab3_scale.sql` (test data of adjustable size for the Investigate part)",
  objectives: [
    "Write scalar and table-valued user-defined functions.",
    "Write a stored procedure that checks business rules, uses a transaction and reports errors with TRY…CATCH and THROW.",
    "Write triggers that maintain derived data and an audit log, correctly for statements that change many rows.",
    "Compare a cursor solution with a set-based solution of the same task by a controlled experiment.",
  ],
  outcomes: [
    "choose between a function, a procedure and a trigger for a given rule;",
    "write T-SQL code that is all-or-nothing in the presence of errors;",
    "use the inserted and deleted tables in set-based triggers;",
    "measure and explain the performance difference between row-by-row and set-based processing.",
  ],
  requirements: [
    H2("Part 1 – session 24 (4 points)"),
    ...numbered([
      "**1.1 (1.0).** Write the scalar function `dbo.grade_points(@grade)` that returns the grade points of a letter grade: A 4.0, A- 3.7, B+ 3.3, B 3.0, B- 2.7, C+ 2.3, C 2.0, C- 1.7, F 0.0, and null for a null or unknown grade. Use it to compute the GPA (credit-weighted average of grade points, ignoring null grades) of students S0001 and S0003.",
      "**1.2 (1.0).** Write the inline table-valued function `dbo.transcript(@ID)` returning course_id, title, semester, year, credits, grade and grade points of every course taken by a student. Query it for S0001.",
      "**1.3 (2.0).** Write the procedure `dbo.register_student(@ID, @course_id, @sec_id, @semester, @year)` that inserts a takes row with a null grade. It must reject, with THROW and error numbers 50001–50005: an unknown student; an unknown section; a duplicate registration; a missing prerequisite (every prerequisite must have been taken with a grade that is neither null nor F); a full section (number of registrations has reached the room capacity). Use a transaction and TRY…CATCH. Show one successful call and one call for each error you can produce with the sample data.",
    ]),
    H2("Part 2 – session 25 (2 points)"),
    ...numbered([
      "**2.1 (1.0).** Write an AFTER UPDATE trigger on takes that adds the course credits to student.tot_cred when a grade changes from null or F to a passing grade (the credits_earned example of DSC §5.3, written for SQL Server). It must be correct when one update statement changes many rows. Test it with one statement that grades all students of CS-347 in Fall 2026, then undo the test.",
      "**2.2 (1.0).** Create the table `salary_audit(audit_id, ID, old_salary, new_salary, changed_by, changed_at)` and an AFTER UPDATE trigger on instructor that records every change of salary, including changes from or to null. Test it with a statement that raises every Physics salary by 5% inside a transaction that you roll back.",
    ]),
    H2("Investigate – cursor versus set-based processing (4 points)"),
    P("Task: recompute tot_cred of every student as the sum of credits of the courses passed (grade not null and not F). `lab3_scale.sql` creates the tables `stu_x(ID, tot_cred)` and `takes_x(ID, seq, credits, grade)` with @n students and 10 takes rows per student."),
    ...numbered([
      "State a **hypothesis** about how the running times of a cursor solution and a set-based solution grow with the number of students.",
      "Write the cursor solution (one update per student) and the set-based solution (one update statement).",
      "Measure both for @n = 1,000, 10,000 and 100,000 (rerun `lab3_scale.sql` for each size). Use `sysdatetime()` before and after each solution and report the times in a table. Check that both solutions produce the same tot_cred values.",
      "Explain the results with reference to DSC §5.2–5.3 and the session-23 discussion of row-by-row versus set-based processing. Name one situation where a cursor would still be justified.",
    ]),
  ],
  hints: [
    ...bullets([
      "`create or alter function` / `procedure` / `trigger` lets you rerun your script.",
      "Inside a procedure: `throw 50004, 'Prerequisite not satisfied.', 1;` In the catch block: `if @@trancount > 0 rollback transaction; throw;`",
      "SQL Server triggers fire once per statement. Join `inserted` and `deleted` on the full primary key of takes; never assume one row.",
      "`update(salary)` tells whether the column appears in the update statement, not whether a value changed: compare old and new values, taking nulls into account.",
      "For the cursor, `declare c cursor local fast_forward for …` is the cheapest cursor type; close and deallocate it.",
      "Measure each size at least twice and report the second run, so that both solutions start with the data in the buffer.",
    ]),
  ],
  rubric: [
    ["1.1 scalar function and GPA", 1, "Function and GPA query correct; nulls ignored", "Function correct, GPA wrong (0.5)"],
    ["1.2 table-valued function", 1, "Inline function correct and used in a from clause", "Works but multi-statement or wrong columns (0.5)"],
    ["1.3 stored procedure", 2, "All five rules, transaction, TRY…CATCH and THROW; tests shown", "−0.3 per missing rule; −0.5 if no transaction/rollback"],
    ["2.1 credits trigger", 1, "Set-based, correct for multi-row updates, tested and undone", "Correct for single-row updates only (0.5)"],
    ["2.2 audit trigger", 1, "Records only real changes, including null cases", "Records rows whose salary did not change, or misses null cases (0.5)"],
    ["Investigate: hypothesis and code", 1.5, "Testable hypothesis; both solutions correct and give equal results", "One solution wrong, or equality not checked"],
    ["Investigate: measurements", 1, "Three sizes, repeated runs, clear table", "Fewer sizes or single runs"],
    ["Investigate: explanation", 1.5, "Explains per-statement overhead and optimizer scope; cites the textbook; justified cursor use", "Partly correct or no reference"],
  ],
  solution: [
    ...bullets([
      "1.1: a `case @grade when 'A' then 4.0 … else null end` function. GPA: S0001 3.785714, S0003 1.35 (CS-101 B-, MA-101 F).",
      "1.2: `returns table as return (select … from takes t join course c on c.course_id = t.course_id where t.ID = @ID)`; S0001 has 6 rows, two with null grade.",
      "1.3: with the sample data, `exec dbo.register_student 'S0003', 'CS-201', '1', 'Spring', 2026` succeeds (CS-101 passed); repeating it raises 50003; `'S0004', 'CS-315', '1', 'Fall', 2026` raises 50004. Remove the test row afterwards.",
    ]),
    ...code(
"create or alter trigger dbo.credits_earned on takes after update as\nbegin\n  set nocount on;\n  update s set tot_cred = s.tot_cred + x.earned\n  from student s\n  join (select i.ID, sum(c.credits) as earned\n        from inserted i\n        join deleted d on d.ID = i.ID and d.course_id = i.course_id and d.sec_id = i.sec_id\n                      and d.semester = i.semester and d.year = i.year\n        join course c on c.course_id = i.course_id\n        where i.grade is not null and i.grade <> 'F'\n          and (d.grade is null or d.grade = 'F')\n        group by i.ID) x on x.ID = s.ID;\nend;"),
    ...bullets([
      "2.1 test: grading CS-347 (Fall 2026) with 'A' raises tot_cred of S0001 from 32 to 35 and of S0013 from 40 to 43. The `group by i.ID` matters when one student gets several grades in one statement.",
      "2.2 test: the Physics raise records I3001 (95,000 → 99,750) and I3002 (83,000 → 87,150); setting I9000's salary records null → 50,000.",
      "Investigate (one run in the test container, @n = 10,000, 100,000 takes rows): cursor about 9,400 ms, set-based about 40 ms. The cursor executes two statements per student; the set-based update is one statement that the optimizer evaluates with a single aggregation and join. Expect roughly linear growth for both, with a much larger constant for the cursor.",
    ]),
  ],
});

// ------------------------------------------------------------------ Lab 4
const lab4 = lab({
  n: 4, title: "E-R design, reduction to relational schemas and implementation",
  subtitle: "Design a database for a clinic, reduce it to relations, implement it in SQL Server, and test a design alternative.",
  sessions: "31", clos: "CLO2",
  reading: "DSC Ch. 6, §6.1–6.9, pp. 241–284; Exercises pp. 294–299",
  files: "This handout (requirements below). No database script: you create the database Clinic yourself.",
  objectives: [
    "Build an E-R model from written requirements, using the notation of DSC Chapter 6.",
    "Reduce the E-R model to relational schemas following DSC §6.7.",
    "Implement the schemas in SQL Server with keys and integrity constraints that express the cardinality and participation constraints where possible.",
    "Investigate whether a ternary relationship can be replaced by binary relationships without losing information.",
  ],
  outcomes: [
    "identify entity sets, weak entity sets, relationship sets, attributes and constraints in requirements;",
    "apply the reduction rules for composite, multivalued and derived attributes, weak entity sets and relationship sets;",
    "state which requirements the schema enforces and which need other mechanisms;",
    "construct a counterexample that shows the information lost by a design alternative.",
  ],
  requirements: [
    P("The requirements are published with this handout one week before the lab, so that you can draft the E-R diagram in advance. The diagram, the schemas and the script are produced and submitted in the session."),
    H2("Requirements of the clinic database"),
    ...bullets([
      "The clinic has **departments**, each with a unique code, a unique name and a floor number. Every department has at most one head, who is a doctor; a doctor heads at most one department.",
      "A **doctor** has an identifier, a first and last name, an optional phone number and one or more specialties. Every doctor works in exactly one department.",
      "A **patient** has an identifier, a first and last name, a date of birth, an address (street and city) and any number of phone numbers. The age of a patient is needed in reports.",
      "A **ward** has a number, a name and belongs to one department. A ward contains **beds** numbered 1, 2, 3, … within the ward; bed numbers repeat across wards.",
      "A patient may occupy at most one bed at a time and a bed holds at most one patient; the admission date is recorded.",
      "A **drug** has a code, a name and a unit price.",
      "A **prescription** records which doctor prescribed which drug to which patient, with the date and the dosage. The clinic keeps only the current prescription for each combination of doctor, patient and drug.",
    ]),
    H2("Tasks (6 points)"),
    ...numbered([
      "**4.1 (3.0).** Draw the E-R diagram in DSC notation: primary keys, composite, multivalued and derived attributes, a weak entity set with its identifying relationship and discriminator, mapping cardinalities and total participation.",
      "**4.2 (1.5).** List the relational schemas obtained by the reduction of DSC §6.7, with primary and foreign keys. State which schemas you combined or removed, and why.",
      "**4.3 (1.5).** Implement the schemas in a new database Clinic. For each requirement listed above, state in a comment whether your DDL enforces it, and if not, how it could be enforced (check, trigger, procedure or application).",
    ]),
    H2("Investigate – ternary versus binary relationships (4 points)"),
    P("Claim to test: _the ternary relationship set prescribes(doctor, patient, drug) can be replaced by three binary relationship sets doctor–patient, patient–drug and doctor–drug without losing information._"),
    ...numbered([
      "Write a **hypothesis**: is the claim true or false? Explain your reasoning with DSC §6.9.",
      "Insert a small instance of prescribes (three to five rows). Derive the three binary relations from it with `select distinct`.",
      "Join the three binary relations and compare the result with prescribes using `except` in both directions. Report every tuple that differs.",
      "Explain the result. Then describe how DSC's alternative (an artificial entity set with three binary relationship sets) avoids the problem, and what extra constraint it needs.",
    ]),
  ],
  hints: [
    ...bullets([
      "Weak entity set: bed, identified by ward through its discriminator bed_no; the primary key of bed is (ward_no, bed_no).",
      "The head of a department is a one-to-one relationship with partial participation of doctor. A unique filtered index `create unique index … where head_id is not null` lets several departments have no head.",
      "Total participation of doctor in works_in can be expressed by a not-null foreign key in doctor. Total participation of department ('every department has a doctor') cannot be expressed with keys alone.",
      "Derived attribute age: compute it in a view from date_of_birth, not in a stored column.",
      "For the Investigate part, choose rows in which two doctors share a patient and two drugs are each prescribed by more than one doctor.",
      "Script tip: in SSMS, `create view` must be the first statement of a batch; put `go` before it.",
    ]),
  ],
  rubric: [
    ["4.1 E-R diagram", 3, "All entity and relationship sets; correct notation for keys, weak entity set, multivalued, composite and derived attributes, cardinalities and participation", "−0.25 per missing or wrong construct"],
    ["4.2 reduction", 1.5, "Correct schemas with keys; combinations justified (DSC §6.7)", "Correct schemas but no justification (1.0)"],
    ["4.3 implementation", 1.5, "Script runs; constraints match the schemas; enforcement of each requirement discussed", "Runs but constraints or discussion incomplete"],
    ["Investigate: hypothesis", 0.5, "Stated before the experiment with a reason", "No reason given"],
    ["Investigate: counterexample", 1.5, "Instance, binary relations, join and both `except` queries shown", "Join shown without comparison, or instance that shows no difference"],
    ["Investigate: explanation", 2, "Spurious tuple explained; artificial entity set approach and its extra constraint described with DSC §6.9", "Partly correct or no reference"],
  ],
  extraSubmit: ["The E-R diagram as a PDF or PNG image (any drawing tool), placed in the report or as a separate file `IDB201_Lab4_<StudentID>_ER.pdf`."],
  solution: [
    ...bullets([
      "Entity sets: department, doctor, patient, ward, drug; weak entity set bed (identifying relationship with ward). Relationship sets: works_in (doctor → department, many-to-one, total on doctor), heads (one-to-one, partial), ward_of (ward → department, many-to-one, total on ward), occupies (patient–bed, one-to-one, partial, attribute admitted), prescribes (ternary, attributes presc_date and dosage).",
      "Multivalued: {specialty}, {phone} of patient; composite: address(street, city); derived: age().",
      "Schemas after combination: department(dept_code, name, floor, head_id), doctor(doctor_id, first_name, last_name, phone, dept_code), doctor_specialty(doctor_id, specialty), patient(patient_id, first_name, last_name, date_of_birth, street, city), patient_phone(patient_id, phone), ward(ward_no, name, dept_code), bed(ward_no, bed_no), occupies(patient_id, ward_no, bed_no, admitted) with unique (ward_no, bed_no), drug(drug_code, name, unit_price), prescribes(doctor_id, patient_id, drug_code, presc_date, dosage) with primary key (doctor_id, patient_id, drug_code). The identifying relationship of bed is not a separate schema.",
      "Not enforced by keys: every department has at least one doctor; the head of a department works in that department. Both need a trigger or a procedure.",
    ]),
    ...code(
"-- instance: (D1, P1, X), (D1, P2, Y), (D2, P1, Y)\nselect distinct doctor_id, patient_id into dp from prescribes;\nselect distinct patient_id, drug_code into px from prescribes;\nselect distinct doctor_id,  drug_code into dx from prescribes;\nselect dp.doctor_id, dp.patient_id, px.drug_code\nfrom   dp join px on px.patient_id = dp.patient_id\n          join dx on dx.doctor_id = dp.doctor_id and dx.drug_code = px.drug_code\nexcept\nselect doctor_id, patient_id, drug_code from prescribes;   -- (D1, P1, Y)"),
    ...bullets([
      "The join returns 4 tuples for 3 prescriptions; (D1, P1, Y) is spurious: D1 treats P1, P1 takes Y and D1 prescribes Y, but D1 never prescribed Y to P1. The reverse `except` is empty. The claim is false.",
      "DSC §6.9: replace prescribes by an entity set E (e.g. prescription with an identifier) and binary relationship sets E–doctor, E–patient, E–drug, each many-to-one and total on E. The identifier is an extra attribute, and a constraint is needed so that no two E entities have the same (doctor, patient, drug), i.e. a unique key on the three foreign keys.",
    ]),
  ],
});

// ------------------------------------------------------------------ Lab 5
const lab5 = lab({
  n: 5, title: "Indexes, execution plans and concurrency",
  subtitle: "Part 1: indexes and execution plans on large tables (Investigate). Part 2: concurrency experiments with two sessions; serializability by precedence graph.",
  sessions: "48 (part 1) and 54 (part 2)", clos: "CLO6, CLO7, CLO8",
  reading: "DSC Ch. 14, §14.1–14.3; Ch. 15, §15.2–15.5; Ch. 16, §16.1–16.2; Ch. 17, §17.5–17.9; Ch. 18, §18.1–18.2, §18.4; Exercises pp. 679–682, 736–739, 789–793, 831–833, 899–903",
  files: "`university_sqlserver.sql`; `lab5_large.sql` (creates student_big with 200,000 rows, takes_big with 2,000,000 rows, and account with 10 rows)",
  objectives: [
    "Read SQL Server execution plans and I/O statistics.",
    "Measure the effect of an index on the cost of selections, and find when the optimizer prefers a scan.",
    "Compare join algorithms chosen by the optimizer with forced alternatives.",
    "Reproduce dirty reads, non-repeatable reads, phantoms and deadlocks with two sessions, and analyse the observed schedules for conflict serializability.",
  ],
  outcomes: [
    "relate logical reads and plan operators to the cost model of DSC Chapter 15;",
    "explain the selectivity at which an index stops paying off;",
    "explain which anomalies each isolation level allows, with evidence from SQL Server;",
    "draw the precedence graph of an observed schedule and decide whether it is conflict serializable.",
  ],
  requirements: [
    P("Prepare before session 48: run `lab5_large.sql` (about one minute). In SSMS, turn on _Include Actual Execution Plan_ (Ctrl+M) and run `set statistics io on;` in your query window."),
    H2("Part 1 – indexes and execution plans, session 48 (4 points)"),
    ...numbered([
      "**1.1 (0.75).** Run `select ID, dept_name from student_big where name = 'Student 123456';`. Record the plan operator and the logical reads of student_big. Explain the number of logical reads.",
      "**1.2 (0.75).** Create a nonclustered index on student_big(name) and rerun the query. Record the operators (seek, lookup) and the logical reads, and compare with the cost formulas of DSC §15.3 (A2, A4).",
      "**1.3 Investigate (1.5).** Create an index on student_big(tot_cred). Hypothesis: _there is a selectivity above which the optimizer no longer uses the index_. Run `select ID, name, dept_name from student_big where tot_cred between 0 and k` for k = 0, 2, 5, 10, 40. For each k, record the number of rows, the plan and the logical reads. Then force the index with `with (index(<index name>))` for k = 40 and compare. Plot logical reads against the number of rows and explain the break-even point.",
      "**1.4 Investigate (1.0).** Run `select s.dept_name, count(*) from student_big s join takes_big t on t.ID = s.ID where t.grade = 'F' group by s.dept_name;` with the optimizer's choice and with `option (loop join)`, `option (merge join)` and `option (hash join)`. Record the join operator and the logical reads of each table. Explain the differences with DSC §15.5, and explain why a join restricted to `s.ID between 1 and 50` gets a different plan.",
    ]),
    H2("Part 2 – concurrency, session 54 (6 points)"),
    P("Open two query windows in SSMS (session A and session B) on the database University. Execute the statements in the order given; the numbers show the time order. Recreate the account table with `lab5_large.sql` if you need a fresh start."),
    ...numbered([
      "**2.1 (1.0) Dirty read.** A: `begin tran; update account set balance = balance - 100 where id = 1;` B: `set transaction isolation level read uncommitted; select balance from account where id = 1;` A: `rollback;` Repeat with B at `read committed`. Record what B sees and when.",
      "**2.2 (1.5) Non-repeatable reads and phantoms.** (a) A at read committed reads the balance of account 3 twice inside one transaction; between the two reads, B adds 1 to that balance. (b) Repeat (a) with A at repeatable read. (c) A at repeatable read counts the Hanoi accounts twice; between the counts, B inserts a new Hanoi account. (d) Repeat (c) with A at serializable. For each case, record A's results and whether B waited.",
      "**2.3 (1.0) Deadlock.** A updates account 1 then account 2; B updates account 2 then account 1, interleaved so that each holds one lock. Record the error message and which transaction was rolled back. Draw the wait-for graph at the moment of the deadlock.",
      "**2.4 Investigate (2.5).** Hypothesis: _each isolation level prevents exactly the anomalies listed for it in DSC §17.8_. For the schedules observed in 2.1 (read uncommitted), 2.2(a) and 2.2(c): write each schedule as a sequence of read and write operations, draw its precedence graph, and decide whether it is conflict serializable (DSC §17.6). Compare your observations with the table of DSC §17.8 and explain what SQL Server does with locks at each level (DSC §17.9, §18.1, §18.4).",
    ]),
  ],
  hints: [
    ...bullets([
      "Logical reads count 8 KB pages read from the buffer; they are close to the block transfers of the DSC cost model if nothing is cached.",
      "In the graphical plan, an index seek followed by a _Key Lookup_ is a secondary-index access that fetches each matching row from the clustered index.",
      "If two runs give different plans, run `dbcc freeproccache` only on your own machine, never on a shared server.",
      "Concurrency: a statement that waits is blocked by a lock; it continues as soon as the other session commits or rolls back. Keep the transactions short and always finish them.",
      "SQL Server's default isolation level is read committed (with locking, unless read committed snapshot is enabled).",
      "A precedence graph has an edge Ti → Tj for each pair of conflicting operations where Ti's operation comes first (DSC §17.6).",
    ]),
  ],
  rubric: [
    ["1.1–1.2 scan and seek", 1.5, "Operators and logical reads recorded and related to DSC §15.3", "Recorded without explanation (0.75)"],
    ["1.3 Investigate: selectivity", 1.5, "Five values of k, forced plan, plot, break-even explained by random lookups versus sequential scan", "Fewer values or no explanation"],
    ["1.4 Investigate: join algorithms", 1, "Four variants and the small-range join; differences explained with DSC §15.5", "Variants recorded without explanation"],
    ["2.1 dirty read", 1, "Both levels; values and blocking explained", "One level only"],
    ["2.2 non-repeatable reads and phantoms", 1.5, "Four cases with results and waiting behaviour", "−0.4 per missing case"],
    ["2.3 deadlock", 1, "Error 1205, victim and wait-for graph", "No wait-for graph (0.5)"],
    ["2.4 Investigate: serializability", 2.5, "Three schedules written, precedence graphs correct, conclusions compared with DSC §17.8 and lock behaviour explained", "Graphs partly wrong or no comparison"],
  ],
  solution: [
    H3("Part 1 (measured in the test container; values on lab PCs may differ slightly)"),
    ...table([3, 1.3, 3], ["Query", "Logical reads", "Plan"], [
      ["1.1 name = 'Student 123456', no index", "6,085", "Clustered Index Scan"],
      ["1.2 same, index on name", "6", "Index Seek + Key Lookup (Nested Loops)"],
      ["1.3 k = 0 (1,242 rows)", "3,817", "Index Seek + Key Lookup"],
      ["1.3 k = 2, 5, 10, 40 (3,726 to 50,931 rows)", "6,085", "Clustered Index Scan"],
      ["1.3 k = 40, index forced", "156,076", "Index Seek + Key Lookup"],
    ]),
    ...bullets([
      "Break-even: each key lookup costs about 3 page reads (height of the clustered index), so the index pays off only while 3 × rows < about 6,085 pages, i.e. for roughly 2,000 rows (1% of the table). This matches the DSC observation that a secondary index on a non-key can be worse than a linear scan (A4 versus A1).",
      "1.4: the optimizer chose Hash Match (6,390 + 7,285 logical reads, parallel); loop join read takes_big 645,452 times as many pages (one index lookup per student); merge join read each table once in key order (6,085 + 7,095). For `s.ID between 1 and 50` the plan is a Merge Join with 5 + 5 logical reads: both inputs are small ranges of the clustered indexes.",
    ]),
    H3("Part 2 (observed in the test container)"),
    ...bullets([
      "2.1: at read uncommitted B sees 400 (the uncommitted value); at read committed B waits until A rolls back and sees 500.",
      "2.2: (a) A reads 800 then 801: non-repeatable read. (b) B's update waits until A commits; A reads the same value twice. (c) A counts 4 then 5: phantom; B's insert is not blocked. (d) B's insert waits until A commits; A counts 4 twice.",
      "2.3: one session receives error 1205 ('… was deadlocked on lock resources with another process and has been chosen as the deadlock victim'); its transaction is rolled back, the other commits. Wait-for graph: A → B and B → A.",
      "2.4: 2.1 at read uncommitted is w_A(x1) r_B(x1) abort_A: B read a value of an uncommitted transaction that then aborted (dirty read); if B used the value and committed, the schedule would not be recoverable (DSC §17.7). 2.2(a) is r_A(x3) w_B(x3) r_A(x3): edges A → B and B → A form a cycle, so it is not conflict serializable. 2.2(c): A's predicate read and B's insert of a matching tuple conflict on the predicate; tuple-level analysis misses it, which is why DSC §18.4 introduces predicate and index locking. Observations agree with DSC §17.8.",
    ]),
  ],
});

const labs = { 1: lab1, 2: lab2, 3: lab3, 4: lab4, 5: lab5 };
const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(labs);
(async () => {
  for (const k of want) await build(path.join(__dirname, "out", `IDB201_Lab${k}.docx`), labs[k], { title: `IDB201 Lab ${k}`, header: `IDB201 – Lab ${k}` });
})();
