// Chapter 4 – Intermediate SQL: joins, views, constraints, indexes, recursion, SQL from programs (sessions 15–18)
const L = require("../lib");
const { HEX, X0, CW } = L;
const src = (x) => `Source: DSC 7th ed., ${x}`;
const ex = (x) => `Example on the University data (givenDB), checked on the course data; DSC 7th ed., ${x}`;

module.exports = {
  n: 4,
  title: "Intermediate SQL: joins, views, constraints, recursion",
  textbook: "DSC Ch. 4, §4.1–4.6, pp. 125–164; §5.1, pp. 183–197; §5.4, pp. 213–218. Self-study: §4.7, §5.5, §9.8.",
  clos: ["CLO2", "CLO3", "CLO4"],
  objectives: [
    "Write inner and outer joins and choose between them",
    "Define views and explain when a view can be updated",
    "Declare not null, unique, check and foreign-key constraints with cascading actions",
    "Create indexes and explain what they change and what they do not",
    "Write a recursive query and explain why relational algebra cannot express it",
    "Call SQL safely from a program with parameters, and explain SQL injection",
  ],
  sessions: [
    { n: 15, name: "Joins and views", sum: "4.1 inner and outer joins; 4.2 views, materialized views, view update",
      slides: [
        { k: "code", h: "4.1 Join expressions", src: src("§4.1; SQL Server FROM clause"), codeW: 7.4, code:
"select s.name, t.course_id\nfrom   student s\n join  takes t on s.ID = t.ID;\n\nselect s.name, c.title\nfrom   student s\n join  takes t  on s.ID = t.ID\n join  course c\n       on t.course_id = c.course_id;",
          items: ["join … on allows any predicate", "DSC also writes natural join and join … using", "SQL Server supports neither: write join … on"] },
        { k: "cards", h: "4.1 The trap of natural join", src: src("§4.1.1"), cards: [
          ["Natural join", "Equates all attributes with the same name and keeps one copy"],
          ["The trap", "student and course both have dept_name: student natural join takes natural join course also requires the same department"],
          ["Habit", "Name the join attributes explicitly with on (or using)", HEX.paleOrange]] },
        { k: "draw", h: "4.1 Inner and outer joins", src: "Diagram drawn for IDB201 after DSC 7th ed., §4.1.2", draw: (s) => {
          const kinds = [["inner join", [1, 0, 0]], ["left outer join", [1, 1, 0]], ["right outer join", [1, 0, 1]], ["full outer join", [1, 1, 1]]];
          kinds.forEach(([t, f], i) => {
            const x = 0.7 + i * 3.1;
            s.addShape("ellipse", { x, y: 1.8, w: 1.8, h: 1.6, fill: { color: f[1] ? HEX.paleOrange : HEX.white }, line: { color: HEX.navy, width: 2 } });
            s.addShape("ellipse", { x: x + 1.0, y: 1.8, w: 1.8, h: 1.6, fill: { color: f[2] ? HEX.paleOrange : HEX.white, transparency: 30 }, line: { color: HEX.navy, width: 2 } });
            L.text(s, "match", x + 0.95, 2.35, 0.9, 0.5, { fontSize: 18, bold: true, color: HEX.orange, align: "center" });
            L.text(s, t, x - 0.1, 3.6, 3.0, 0.5, { fontSize: 20, bold: true, color: HEX.navy, align: "center", fontFace: L.CODE });
          });
          L.autoCard(s, X0, 4.6, CW, 1.9, null, "Inner join keeps only matching pairs. An outer join also keeps the unmatched tuples of one or both sides and pads them with nulls.", "outer", { fill: HEX.pale });
        } },
        { k: "code", h: "4.1 Left outer join", src: ex("§4.1.2"), codeW: 7.4, code:
"-- students who have taken no course\nselect s.ID, s.name\nfrom   student s\n left outer join takes t\n       on s.ID = t.ID\nwhere  t.course_id is null;\n\n-- S0004 Dung, S0019 Yen",
          items: ["Unmatched students get nulls for the takes attributes", "is null then finds them", "Same result as the not exists query of Chapter 3"] },
        { k: "code", h: "4.1 on and where are not interchangeable", src: ex("§4.1.2"), codeW: 7.6, code:
"select d.dept_name,\n       count(i.ID) as n\nfrom   department d\n left outer join instructor i\n       on d.dept_name = i.dept_name\ngroup by d.dept_name;\n\n-- Philosophy 0, Biology 2,\n-- Comp. Sci. 4, …",
          items: ["on is part of the join: unmatched departments survive", "A condition on i in where would drop them again", "count(i.ID) counts 0 for padded nulls; count(*) would count 1"] },
        { k: "code", h: "4.2 Views", src: ex("§4.2"), codeW: 7.2, code:
"create view faculty as\n  select ID, name, dept_name\n  from   instructor;\ngo\nselect name\nfrom   faculty\nwhere  dept_name = 'Biology';\n-- Mendel, Dang",
          items: ["A view is a virtual relation defined by a query", "It hides data a user should not see (salary)", "go ends a batch in SSMS: create view must start a batch"] },
        { k: "cards", h: "4.2 How views work", src: src("§4.2.1–4.2.2"), cards: [
          ["Stored definition", "Only the query is stored, not its result"],
          ["View expansion", "A query on a view is rewritten into a query on the base relations"],
          ["Views on views", "A view can be defined with other views, as long as there is no cycle"]],
          note: "So a non-materialized view costs nothing extra at run time (CQ4.2)." },
        { k: "cards", h: "4.2 Materialized views", src: src("§4.2.3; SQL Server indexed views"), cards: [
          ["Stored result", "The system stores the result of the view"],
          ["View maintenance", "The result is kept up to date when base relations change"],
          ["Trade-off", "Faster queries; extra storage and slower updates", HEX.paleOrange],
          ["SQL Server", "Implemented as indexed views"]] },
        { k: "cards", h: "4.2 Updating through a view", src: src("§4.2.4"), cards: [
          ["The problem", "An update on a view must become an update on base relations; this is not always possible or unique"],
          ["Simple views", "One relation in from, plain attributes in select, no group by, distinct or aggregate"],
          ["with check option", "Rejects tuples that would not satisfy the view's where clause", HEX.paleOrange]] },
      ] },
    { n: 16, name: "Constraints and types", sum: "4.3 transactions (preview); 4.4 integrity constraints; 4.5 types and schemas",
      slides: [
        { k: "code", h: "4.3 Transactions (preview)", src: src("§4.3; SQL Server BEGIN TRANSACTION"), codeW: 6.8, code:
"begin transaction;\n  update instructor\n     set salary = salary * 1.05\n   where dept_name = 'Physics';\n  -- … more statements …\ncommit transaction;\n-- or: rollback transaction;",
          items: ["A transaction is a unit of statements", "commit makes its updates permanent; rollback undoes them", "SQL Server commits each statement unless a transaction is started", "Full treatment: Chapter 10"] },
        { k: "code", h: "4.4 Constraints on a single relation", src: src("§4.4.1–4.4.4"), codeW: 7.4, code:
"create table section\n (course_id    varchar(8),\n  sec_id       varchar(8),\n  semester     varchar(6),\n  year         numeric(4,0),\n  building     varchar(15),\n  room_number  varchar(7),\n  time_slot_id varchar(4),\n  primary key (course_id, sec_id,\n               semester, year),\n  check (semester in ('Fall',\n   'Winter', 'Spring', 'Summer')));",
          items: ["check (P): every tuple must satisfy P", "unique (A1, …, Am): a candidate key", "not null: no null allowed"] },
        { k: "cards", h: "4.4 Details that matter", src: src("§4.4"), cards: [
          ["unique and null", "unique attributes may still be null, unless also declared not null"],
          ["check and unknown", "A check fails only if P is false: a null that makes P unknown passes"],
          ["Named constraints", "constraint ck_credits check (credits > 0) can later be dropped by name"]] },
        { k: "code", h: "4.4 Referential integrity", src: src("§4.4.5"), codeW: 7.4, code:
"create table course\n (course_id varchar(8),\n  title     varchar(50),\n  dept_name varchar(20),\n  credits   numeric(2,0)\n            check (credits > 0),\n  primary key (course_id),\n  foreign key (dept_name)\n    references department\n    on delete cascade\n    on update cascade);",
          items: ["A value in course.dept_name must appear in department", "Default on violation: reject the change", "Alternatives: cascade, set null, set default"] },
        { k: "cards", h: "Deleting the department Physics", src: "Example written for IDB201 on DSC 7th ed., §4.4.5", cards: [
          ["no action (default)", "The delete is rejected while courses of Physics exist"],
          ["on delete cascade", "The Physics courses are deleted too (and further cascades follow)"],
          ["on delete set null", "The courses stay, with dept_name = null"]],
          note: "Choose the action from the meaning of the data, not for convenience." },
        { k: "cards", h: "4.4 Constraints across relations", src: src("§4.4.8; SQL Server CREATE TRIGGER"), cards: [
          ["Assertions", "create assertion states a condition over the whole database"],
          ["In practice", "Most systems, SQL Server included, do not support assertions"],
          ["Instead", "Use triggers (Chapter 5) or check the rule in a stored procedure", HEX.paleOrange]] },
        { k: "table", h: "4.5 SQL data types and schemas", src: src("§4.5; SQL Server documentation"), size: 20, rowH: 0.64, colW: [3.0, 4.6, 4.53], rows: [
          ["Feature", "Standard SQL (DSC)", "SQL Server"],
          ["Date and time", "date, time, timestamp", "date, time, datetime2"],
          ["Type conversion", "cast (e as t)", "cast, convert"],
          ["Large objects", "clob, blob", "varchar(max), varbinary(max)"],
          ["User-defined types", "create type, create domain", "create type; no create domain"],
          ["Generated keys", "generated always as identity", "identity(1, 1)"],
          ["Namespaces", "catalog.schema.relation", "database.schema.object"]] },
        { k: "code", h: "4.5 Defaults and generated keys", src: src("§4.5.6–4.5.7; SQL Server IDENTITY"), codeW: 7.4, code:
"create table enrollment_log\n (log_id   int identity(1, 1)\n           primary key,\n  ID       varchar(5) not null,\n  logged   datetime2\n           default sysdatetime());\n\ninsert into enrollment_log (ID)\nvalues ('S0001');",
          items: ["identity generates the key values", "default fills an omitted attribute", "Useful for audit tables (Lab 3)"] },
        { k: "cards", h: "Self-study: §4.7 Authorization", src: "Self-study source: DSC 7th ed., §4.7, pp. 165–172", cards: [
          ["Privileges", "select, insert, update, delete on relations and views"],
          ["grant and revoke", "grant select on student to U1 with grant option; revoke … from …"],
          ["Roles", "Group privileges and give them to many users at once"],
          ["With views", "A view plus a grant restricts what a user can see. Assessed in PT1 and the final exam", HEX.paleOrange]] },
      ] },
    { n: 17, name: "Indexes and recursion", sum: "4.6 index definition; 5.4 recursive queries; self-study §5.5",
      slides: [
        { k: "code", h: "4.6 Index definition in SQL", src: src("§4.6; SQL Server CREATE INDEX"), codeW: 7.4, code:
"create index dept_index\n  on instructor (dept_name);\n\nselect *\nfrom   instructor\nwhere  dept_name = 'Physics';\n\ndrop index dept_index\n  on instructor;  -- SQL Server form",
          items: ["An index finds tuples by value without scanning the whole relation", "The DBMS maintains it on every update"] },
        { k: "cards", h: "4.6 What an index changes", src: src("§4.6"), cards: [
          ["Not the result", "Queries return the same answer with or without the index"],
          ["Not the logical schema", "Indexes belong to the physical level: physical data independence (Chapter 1)"],
          ["The cost", "Some queries get faster; every insert, delete and update gets a little slower", HEX.paleOrange]],
          note: "How indexes work inside: Chapter 8 and Lab 5." },
        { k: "draw", h: "The prereq relation as a graph", src: "Data of the course database University (givenDB); DSC 7th ed., §5.4", draw: (s) => {
          const nodes = { "CS-101": [0.8, 2.0], "CS-201": [3.6, 2.0], "CS-315": [6.4, 2.0], "CS-347": [9.2, 2.0], "MA-210": [3.6, 4.4], "CS-301": [6.4, 4.4], "BI-230": [0.8, 4.4] };
          for (const [k, [x, y]] of Object.entries(nodes)) L.node(s, k, x, y, 2.2, 0.8, { mono: true, fill: k === "CS-347" ? HEX.paleOrange : HEX.white });
          const e = (a, b) => { const [x1, y1] = nodes[a], [x2, y2] = nodes[b]; L.arrow(s, x1 + (x2 > x1 ? 2.2 : x2 === x1 ? 1.1 : 0), y1 + (y2 === y1 ? 0.4 : y2 > y1 ? 0.8 : 0), x2 + (x2 > x1 ? 0 : x2 === x1 ? 1.1 : 2.2), y2 + (y2 === y1 ? 0.4 : y2 > y1 ? 0 : 0.8)); };
          e("CS-101", "CS-201"); e("CS-201", "CS-315"); e("CS-315", "CS-347"); e("CS-201", "CS-301"); e("MA-210", "CS-301"); e("CS-101", "BI-230");
          L.text(s, "An arrow A → B means: A is a prerequisite of B", 0.8, 5.6, 11.0, 0.6, { fontSize: 20, color: HEX.grey });
        } },
        { k: "code", h: "5.4 A recursive query", src: ex("§5.4"), codeW: 7.8, code:
"with rec_prereq(course_id, prereq_id) as (\n    select course_id, prereq_id\n    from   prereq\n  union all\n    select r.course_id, p.prereq_id\n    from   rec_prereq r\n    join   prereq p\n      on   r.prereq_id = p.course_id)\nselect distinct prereq_id\nfrom   rec_prereq\nwhere  course_id = 'CS-347';",
          items: ["Result: CS-315, CS-201, CS-101", "Standard SQL writes with recursive and allows union", "SQL Server requires union all"] },
        { k: "table", h: "5.4 Evaluation up to a fixed point", src: "Example written for IDB201 on the University data; fixed-point evaluation of DSC 7th ed., §5.4", size: 22, rowH: 0.7, colW: [2.2, 5.0, 4.93], rows: [
          ["Iteration", "New prerequisites of CS-347", "Known so far"],
          ["1", "CS-315 (direct)", "CS-315"],
          ["2", "CS-201", "CS-315, CS-201"],
          ["3", "CS-101", "CS-315, CS-201, CS-101"],
          ["4", "none: stop", "fixed point reached"]],
          note: "Each iteration joins once more with prereq; evaluation stops when nothing new appears." },
        { k: "cards", h: "5.4 Rules for recursive queries", src: src("§5.4.2; SQL Server MAXRECURSION"), cards: [
          ["Base and recursive part", "The base query gives direct prerequisites; the recursive part adds one step"],
          ["Monotonic", "No aggregation or not exists on the recursive relation"],
          ["SQL Server limit", "Stops after 100 levels by default; option (maxrecursion n) changes it", HEX.paleOrange]] },
        { k: "bul", h: "Transitive closure and relational algebra", src: src("§5.4; limits of relational algebra"), items: [
          "A fixed expression can join prereq with itself only a fixed number of times",
          "So it finds prerequisites up to some depth k",
          "A database may contain a chain longer than k",
          "Iteration (recursion) adds expressive power beyond relational algebra"],
          right: { card: ["Link to CQ2.3", "Relational algebra cannot compute the transitive closure. This session shows the SQL extension that can."], fill: HEX.pale } },
        { k: "code", h: "Self-study: §5.5 ranking and windows", src: "Self-study source: DSC 7th ed., §5.5, pp. 219–230; checked on the University data", codeW: 7.6, code:
"select name, salary,\n       rank() over\n         (order by salary desc) as r\nfrom   instructor\nwhere  salary is not null;\n\n-- Curie 95000 1, Nguyen 92000 2,\n-- Pham 88000 3, Bohr 83000 4, …",
          items: ["rank, dense_rank, row_number", "partition by ranks within groups", "Window aggregates: moving averages", "Assessed in PT1 and the final exam"] },
        { k: "quick", h: "Quick check: session 17", src: "Questions written for IDB201 on DSC 7th ed., §4.6 and §5.4",
          qs: ["After create index on instructor(dept_name), can a query return a different result?",
               "How many iterations does the recursive query need for the prerequisites of CS-315?",
               "Why does SQL require recursive queries to be monotonic?"],
          ans: "1 no, only the speed changes; 2 three iterations (CS-201, CS-101, then none); 3 so that the iteration reaches a unique fixed point." },
      ] },
    { n: 18, name: "SQL from programs", sum: "5.1 APIs, cursors, prepared statements; SQL injection; CQ4.1–CQ4.3",
      slides: [
        { k: "cards", h: "5.1 SQL from a programming language", src: src("§5.1"), cards: [
          ["Why", "SQL is not a general-purpose language: applications combine a host language with SQL"],
          ["Dynamic SQL", "The program builds SQL at run time and sends it through an API: JDBC, ODBC, Python DB-API"],
          ["Embedded SQL", "SQL is written in the program and translated by a preprocessor"]] },
        { k: "draw", h: "5.1 Connect, execute, fetch", src: "Diagram drawn for IDB201 after DSC 7th ed., §5.1.1", draw: (s) => {
          ["Open a\nconnection", "Execute a\nstatement", "Fetch rows\none by one", "Close and\nhandle errors"].forEach((t, i) => {
            const x = 0.7 + i * 3.1;
            L.node(s, t, x, 1.9, 2.6, 1.3, { size: 20, fill: i === 2 ? HEX.paleOrange : HEX.white });
            if (i < 3) L.arrow(s, x + 2.6, 2.55, x + 3.1, 2.55, { color: HEX.orange });
          });
          L.autoCard(s, X0, 3.9, CW, 2.6, "The result is a set", "The host language works one row at a time, so the API returns a result object that is advanced row by row (a cursor, e.g. ResultSet.next() in JDBC).", "cef", { fill: HEX.pale });
        } },
        { k: "cards", h: "5.1 Cursors and prepared statements", src: src("§5.1.1"), cards: [
          ["Cursor", "Iterates over a query result one row at a time; T-SQL cursors come in session 23"],
          ["Prepared statement", "SQL text with placeholders (?), compiled once and run many times"],
          ["Parameters", "Values are passed separately, never pasted into the SQL text", HEX.paleOrange]] },
        { k: "code", h: "SQL injection", src: src("§5.1.1 (prepared statements and SQL injection)"), codeW: 7.6, code:
"-- the program concatenates:\n\"select * from instructor\n  where name = '\" + name + \"'\"\n\n-- the user types:\nX' or 'Y' = 'Y\n\n-- the query that runs:\nselect * from instructor\nwhere name = 'X' or 'Y' = 'Y'",
          items: ["The input changes the structure of the query", "The where clause is always true: every instructor is returned", "Worse inputs can modify or delete data"] },
        { k: "cards", h: "Defending against SQL injection", src: src("§5.1.1; self-study §9.8"), cards: [
          ["Parameters", "Prepared statements or sp_executesql: the input is always a value"],
          ["Least privilege", "The application's login gets only the rights it needs (§4.7)"],
          ["Not enough alone", "Escaping quotes by hand is fragile: one missed case is enough (CQ4.3)", HEX.paleOrange]] },
        { k: "code", h: "Parameterized queries in T-SQL", src: "SQL Server T-SQL reference (sp_executesql); DSC 7th ed., §5.1", codeW: 8.0, code:
"declare @dept varchar(20) = 'Physics';\n\n-- static SQL with a variable: safe\nselect name from instructor\nwhere  dept_name = @dept;\n\n-- dynamic SQL with a parameter: safe\nexec sp_executesql\n  N'select name from instructor\n    where dept_name = @d',\n  N'@d varchar(20)', @d = @dept;",
          items: ["Never: exec('… ''' + @dept + '''')", "Lab 2 tests this"] },
        { k: "cq", id: "CQ4.1", look: "Where to look: DSC 7th ed., §4.4; Chapter 5 (triggers)", prompts: [
          "What happens when a second application forgets to check the rule?",
          "Which rules cannot be declared as constraints?",
          "When is checking in the application still useful (e.g. friendly messages)?"] },
        { k: "cq", id: "CQ4.2", look: "Where to look: DSC 7th ed., §4.2.1–4.2.3", prompts: [
          "What does view expansion do with a query on a view?",
          "What is stored for a view, and what for a materialized view?",
          "Which workloads profit from materialization, and what does it cost?"] },
        { k: "cq", id: "CQ4.3", look: "Where to look: DSC 7th ed., §5.1.1; self-study §9.8", prompts: [
          "What does the DBMS do with a parameter value compared with SQL text?",
          "Find an input that escaping a single quote does not stop",
          "Why is a rule that must never be forgotten better placed in the API?"] },
      ] },
  ],
  back: [
    { k: "list", h: "Practice exercises", src: "Exercises written for IDB201; more: DSC Practice Exercises 4.1–4.9, pp. 173–175", items: [
      "List every department with its number of instructors, including departments that have none.",
      "Create a view of the Physics instructors with check option. What happens to an insert of a Biology instructor through it?",
      "Write a recursive query for all prerequisites of CS-347 and check the result on University."] },
    { k: "list", h: "Practice exercises: answers", src: "Answers checked on the University data (givenDB); DSC 7th ed., §4.1, §4.2, §5.4", fill: HEX.pale, items: [
      "department left outer join instructor on d.dept_name = i.dept_name, group by d.dept_name, count(i.ID): Philosophy 0.",
      "The insert is rejected: the new tuple would not satisfy dept_name = 'Physics', the where clause of the view.",
      "The query of session 17 with course_id = 'CS-347': CS-315, CS-201, CS-101."] },
    { k: "cards", h: "Summary", src: "DSC 7th ed., §4.1–4.6, §5.1, §5.4", cols: 3, num: false, cards: [
      ["Joins", "Inner, left, right, full outer; on versus where"],
      ["Views", "Virtual relations; materialized views; simple updatable views"],
      ["Constraints", "not null, unique, check, foreign keys with actions"],
      ["Indexes", "Physical, not logical; faster reads, slower updates"],
      ["Recursion", "Fixed point; beyond relational algebra"],
      ["SQL from programs", "APIs, cursors, parameters against injection", HEX.paleOrange]] },
    { k: "cards", h: "Before the next session", src: "IDB201 syllabus, sessions 18–20", cards: [
      ["Within one week", "Choose one of CQ4.1–CQ4.3 and submit your answer on the LMS"],
      ["Session 19", "Lab 2: DDL, constraints, views and parameterized queries", HEX.paleOrange],
      ["Session 20", "Read DSC §5.2 and the T-SQL reference on control-of-flow and CREATE FUNCTION"]] },
  ],
};
