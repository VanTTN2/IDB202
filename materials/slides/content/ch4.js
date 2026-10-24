// Chapter 4 – Intermediate SQL (sessions 15, 16, 17)
module.exports = {
  num: 4,
  title: "Intermediate SQL: joins, views, constraints, recursion",
  short: "Intermediate SQL",
  sessions: [15, 16, 17],
  reading: "Ch. 4, §4.1–4.6, pp. 125–164; §5.4, pp. 213–218",
  slides: [
    { t: "outline", title: "Chapter 4 roadmap", items: [
      { session: 15, head: "Joins and views", points: ["4.1 Join expressions: natural, inner, outer", "4.2 Views, materialized views, view update"] },
      { session: 16, head: "Constraints and types", points: ["4.3 Transactions (preview)", "4.4 Integrity constraints", "4.5 SQL data types and schemas", "Self-study: §4.7 Authorization"] },
      { session: 17, head: "Indexes and recursion", points: ["4.6 Index definition in SQL", "5.4 Recursive queries", "Transitive closure and the limits of relational algebra"] },
    ] },

    // ---------------- Session 15 ----------------
    { t: "session", n: 15, title: "Join expressions and views", reading: "DSC Ch. 4, §4.1–4.2, pp. 125–142" },
    { t: "code", title: "4.1 Join expressions", side: "Notes", code:
"-- natural join: equal values on all common attributes\nselect name, course_id\nfrom   student natural join takes;\n\n-- join ... using: only the listed attributes\nselect name, title\nfrom   (student natural join takes)\n       join course using (course_id);\n\n-- join ... on: any predicate\nselect *\nfrom   student join takes on student.ID = takes.ID;",
      bullets: ["Natural join keeps one copy of each common attribute", "Natural join can equate attributes by accident when two relations share a name (e.g. dept_name)", "join … on allows a general predicate", "SQL Server note: natural join and using are not supported; write join … on"] },
    { t: "code", title: "4.1 Outer joins", side: "Preserving unmatched tuples", code:
"-- every student, with the courses taken if any\nselect *\nfrom   student left outer join takes\n       on student.ID = takes.ID;\n\n-- students who have taken no course\nselect ID\nfrom   student left outer join takes\n       on student.ID = takes.ID\nwhere  takes.course_id is null;\n\n-- right outer join, full outer join: similar",
      bullets: ["Inner join drops tuples without a match", "left outer join pads unmatched left tuples with nulls; right outer join does the same on the right; full outer join on both sides", "With outer joins, on and where are not interchangeable: on is part of the join, where filters afterwards"] },
    { t: "code", title: "4.2 Views", side: "Why views", code:
"create view faculty as\n  select ID, name, dept_name\n  from   instructor;\n\n-- a view used like a relation\nselect name\nfrom   faculty\nwhere  dept_name = 'Biology';\n\ncreate view departments_total_salary\n  (dept_name, total_salary) as\n  select dept_name, sum(salary)\n  from   instructor\n  group by dept_name;",
      bullets: ["A view is a virtual relation defined by a query", "Hides data a user should not see (here: salary)", "The definition is stored; the result is computed when the view is used (view expansion)", "Views can be defined using other views"] },
    { t: "twocol", title: "4.2 Materialized views and update of views", left: { head: "Materialized views", items: [
      "The system stores the result of the view and keeps it up to date (view maintenance)",
      "Faster queries, extra storage and maintenance cost",
      "SQL Server note: implemented as indexed views",
    ] }, right: { head: "Updating through a view", items: [
      "Updates on a view must be translated into updates on base relations; this is not always possible or unique",
      "SQL allows updates on simple views: one relation in from, only attributes in select, no group by, distinct or aggregates",
      "with check option rejects inserted or updated tuples that would not satisfy the view's where clause",
    ] }, notes: "Link to CQ4.2: a (non-materialized) view costs nothing extra at run time because the query is rewritten in terms of the base relations." },

    // ---------------- Session 16 ----------------
    { t: "session", n: 16, title: "Transactions (preview), integrity constraints, SQL data types and schemas", reading: "DSC Ch. 4, §4.3–4.5, pp. 143–163 · Self-study: §4.7 Authorization, pp. 165–172" },
    { t: "bullets", title: "4.3 Transactions (preview)", bullets: [
      "A transaction is a sequence of query and update statements executed as a unit",
      { b: "Commit work:", t: "the updates become permanent" },
      { b: "Rollback work:", t: "all updates of the transaction are undone" },
      "Atomicity: either all effects of a transaction are reflected in the database, or none are",
      "Many systems, including SQL Server, commit each statement automatically unless a transaction is started explicitly",
    ], card: { head: "In T-SQL", body: "begin transaction … commit transaction\nbegin transaction … rollback transaction\nFull treatment: Chapter 10." } },
    { t: "code", title: "4.4 Integrity constraints on a single relation", side: "Constraint types", code:
"create table section\n  (course_id    varchar(8),\n   sec_id       varchar(8),\n   semester     varchar(6),\n   year         numeric(4,0),\n   building     varchar(15),\n   room_number  varchar(7),\n   time_slot_id varchar(4),\n   primary key (course_id, sec_id, semester, year),\n   check (semester in\n          ('Fall', 'Winter', 'Spring', 'Summer')));\n\n-- unique (A1, ..., Am): a candidate key\n-- not null: null not allowed",
      bullets: ["not null", "unique: the attributes form a superkey (nulls allowed unless also not null)", "check (P): every tuple must satisfy P; a check is violated only if P is false (unknown passes)", "Constraints can be named and dropped later"], codeSize: 13 },
    { t: "code", title: "4.4 Referential integrity and cascading actions", side: "Notes", code:
"create table course\n  (course_id  varchar(8),\n   title      varchar(50),\n   dept_name  varchar(20),\n   credits    numeric(2,0) check (credits > 0),\n   primary key (course_id),\n   foreign key (dept_name) references department\n     on delete cascade\n     on update cascade);",
      bullets: ["A foreign key ensures that a value appearing in one relation also appears in another", "Default action on violation: reject the update", "on delete / on update: cascade, set null, set default", "Assertions express constraints over the whole database; most systems, including SQL Server, do not support them – triggers are used instead (Chapter 5)"] },
    { t: "table", title: "4.5 SQL data types and schemas", colW: [3.6, 5.2, 3.5], head: ["Feature", "Standard SQL (DSC)", "SQL Server"], rows: [
      ["Date and time", "date, time, timestamp", "date, time, datetime2"],
      ["Type conversion", "cast (e as t)", "cast, convert"],
      ["Default values", "default clause", "default clause"],
      ["Large objects", "clob, blob", "varchar(max), varbinary(max)"],
      ["User-defined types", "create type, create domain", "create type (alias types); no create domain"],
      ["Generated keys", "generated always as identity", "identity(1, 1)"],
      ["Namespaces", "catalog . schema . relation", "database . schema . object"],
    ] },
    { t: "bullets", title: "Self-study: §4.7 Authorization", bullets: [
      "Privileges: select, insert, update, delete (and others) on relations and views",
      "grant <privilege list> on <relation> to <user or role>; revoke … from …",
      "Roles group privileges; with grant option lets a user pass a privilege on",
      "Views combined with authorization restrict what a user can see",
      "Assessed in Progress test 1 and in the final exam",
    ], card: { head: "Link to CQ4.1", body: "Integrity rules declared in the database are enforced for every application. When might checking in application code still be needed?" } },

    // ---------------- Session 17 ----------------
    { t: "session", n: 17, title: "Index definition in SQL; recursive queries and the limits of relational algebra", reading: "DSC §4.6, p. 164; §5.4, pp. 213–218 · Self-study: §5.5 Advanced aggregation features, pp. 219–230" },
    { t: "code", title: "4.6 Index definition in SQL", side: "Notes", code:
"create index dept_index on instructor (dept_name);\n\n-- a query that can use the index\nselect *\nfrom   instructor\nwhere  dept_name = 'Music';\n\ndrop index dept_index on instructor;   -- SQL Server form",
      bullets: ["An index lets the system find tuples with given attribute values without scanning the whole relation", "Indexes are not part of the logical schema: queries return the same result with or without them", "The DBMS maintains indexes on every update", "How indexes work: Chapter 8"] },
    { t: "code", title: "5.4 Recursive queries: transitive closure", side: "Reading it", code:
"-- all direct and indirect prerequisites (standard SQL)\nwith recursive rec_prereq(course_id, prereq_id) as (\n    select course_id, prereq_id\n    from   prereq\n  union\n    select rec_prereq.course_id, prereq.prereq_id\n    from   rec_prereq, prereq\n    where  rec_prereq.prereq_id = prereq.course_id\n)\nselect * from rec_prereq;\n\n-- SQL Server: write 'with' (no 'recursive')\n-- and 'union all' between the two parts",
      bullets: ["The base query gives direct prerequisites; the recursive query adds one more step each iteration", "Evaluation repeats until no new tuples appear: the fixed point", "Recursive views must be monotonic (no aggregation or not exists on the recursive relation)", "SQL Server stops after 100 levels by default (option maxrecursion)"], codeSize: 13 },
    { t: "bullets", title: "Transitive closure and relational algebra", bullets: [
      "A fixed relational-algebra expression can join prereq with itself only a fixed number of times",
      "So it can find prerequisites up to a fixed depth k, but a database may contain a chain longer than k",
      "No single non-recursive expression works for every database instance",
      "Iteration (recursion) adds expressive power beyond relational algebra",
    ], card: { head: "Link to Chapter 2 (CQ2.3)", body: "Relational algebra cannot compute the transitive closure of a relation. This session shows the SQL extension that can." } },
    { t: "bullets", title: "Self-study: §5.5 Advanced aggregation features", bullets: [
      "Ranking: rank() over (order by …), dense_rank(), row_number()",
      "Windowing: aggregates over a window of rows, e.g. moving averages",
      "partition by computes ranks or windows within groups",
      "SQL Server supports rank, dense_rank, row_number and window aggregates with over (…)",
    ], card: { head: "Assessment", body: "Self-study topic; assessed in Progress test 1 and the final exam." } },
    { t: "summary", points: [
      "Natural join, join … on, and outer joins that keep unmatched tuples with nulls",
      "Views are virtual relations; materialized views are stored and maintained",
      "Transactions commit or roll back as a unit",
      "Constraints: not null, unique, check, foreign keys with cascading actions",
      "Indexes speed up access without changing query results",
      "Recursive queries compute transitive closure, which relational algebra cannot",
    ], next: [
      "Self-study: §4.7 Authorization and §5.5 Advanced aggregation",
      "Read DSC §5.1, pp. 183–197 for session 18",
      "CQ4.1–CQ4.3 are discussed in session 18",
    ] },
  ],
};
