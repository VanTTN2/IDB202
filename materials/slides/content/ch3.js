// Chapter 3 – Introduction to SQL (sessions 9, 10, 11, 12)
module.exports = {
  num: 3,
  title: "Introduction to SQL",
  short: "Introduction to SQL",
  sessions: [9, 10, 11, 12],
  reading: "Ch. 3, §3.1–3.9, pp. 65–113",
  slides: [
    { t: "outline", title: "Chapter 3 roadmap", items: [
      { session: 9, head: "SQL basics", points: ["3.1 Overview of SQL", "3.2 SQL data definition", "3.3 Basic structure of SQL queries"] },
      { session: 10, head: "Operations and nulls", points: ["3.4 Additional basic operations", "3.5 Set operations", "3.6 Null values, three-valued logic"] },
      { session: 11, head: "Aggregates, subqueries", points: ["3.7 Aggregate functions", "3.8 Nested subqueries"] },
      { session: 12, head: "Modification, semantics", points: ["3.9 Modification of the database", "From SQL to relational algebra", "Self-study: bag semantics"] },
    ] },

    // ---------------- Session 9 ----------------
    { t: "session", n: 9, title: "Overview of SQL, SQL data definition, basic structure of SQL queries", reading: "DSC Ch. 3, §3.1–3.3, pp. 65–78" },
    { t: "cards", title: "3.1 Overview of the SQL query language", lead: "SQL is the standard relational database language. It has several parts:", items: [
      { head: "Data definition (DDL)", body: "Define, delete and modify relation schemas." },
      { head: "Data manipulation (DML)", body: "Query, insert, delete and modify tuples." },
      { head: "Integrity and views", body: "Integrity constraints; view definitions." },
      { head: "Transactions and authorization", body: "Begin and end transactions; access rights. Also embedded and dynamic SQL." },
    ], notes: "SQL originated as Sequel at IBM; it is standardized by ANSI/ISO. Products such as SQL Server implement the standard with their own extensions (T-SQL)." },
    { t: "table", title: "3.2 Basic domain types", colW: [3.3, 5.5, 3.5], head: ["Type", "Meaning", "SQL Server"], rows: [
      ["char(n)", "Fixed-length character string of length n", "char(n), nchar(n)"],
      ["varchar(n)", "Variable-length string, maximum length n", "varchar(n), nvarchar(n)"],
      ["int, smallint", "Integers (machine dependent)", "int, smallint, bigint"],
      ["numeric(p, d)", "Fixed-point number: p digits, d after the decimal point", "numeric(p, d), decimal(p, d)"],
      ["real, double precision", "Floating-point numbers", "real, float"],
      ["float(n)", "Floating point, precision of at least n digits", "float(n)"],
    ], caption: "Each type may include the special value null unless the attribute is declared not null." },
    { t: "code", title: "3.2 Schema definition", side: "Integrity constraints", code:
"create table department\n  (dept_name  varchar(20),\n   building   varchar(15),\n   budget     numeric(12,2),\n   primary key (dept_name));\n\ncreate table instructor\n  (ID         varchar(5),\n   name       varchar(20) not null,\n   dept_name  varchar(20),\n   salary     numeric(8,2),\n   primary key (ID),\n   foreign key (dept_name) references department);",
      bullets: ["primary key: attributes are non-null and unique", "foreign key … references: values must appear as a primary key of the referenced relation", "not null: the null value is not allowed for that attribute", "SQL rejects any update that violates a constraint", "drop table r deletes r; alter table r add / drop changes its schema"] },
    { t: "code", title: "3.3 Basic structure: select–from–where", side: "Reading a query", code:
"select name\nfrom   instructor;\n\nselect distinct dept_name\nfrom   instructor;\n\nselect ID, name, salary * 1.1\nfrom   instructor;\n\nselect name\nfrom   instructor\nwhere  dept_name = 'Comp. Sci.' and salary > 70000;",
      bullets: ["select lists the attributes of the result; from lists the relations; where gives a predicate", "SQL keeps duplicates by default; distinct removes them, all keeps them explicitly", "The select clause may contain arithmetic expressions"] },
    { t: "code", title: "3.3 Queries on multiple relations", side: "Meaning", code:
"-- names of instructors with the building\n-- of their department\nselect name, instructor.dept_name, building\nfrom   instructor, department\nwhere  instructor.dept_name = department.dept_name;\n\n-- instructors and the courses they taught\nselect name, course_id\nfrom   instructor, teaches\nwhere  instructor.ID = teaches.ID;",
      bullets: ["Conceptually: form the Cartesian product of the from relations, apply the where predicate, output the select attributes", "Qualify ambiguous attribute names with the relation name", "Real systems evaluate such queries far more efficiently (Chapter 9)"] },

    // ---------------- Session 10 ----------------
    { t: "session", n: 10, title: "Additional basic operations, set operations, null values and three-valued logic", reading: "DSC Ch. 3, §3.4–3.6, pp. 79–90" },
    { t: "code", title: "3.4 Additional basic operations", side: "What each does", code:
"-- rename with as\nselect distinct T.name\nfrom   instructor as T, instructor as S\nwhere  T.salary > S.salary and S.dept_name = 'Biology';\n\n-- string matching\nselect dept_name from department\nwhere  building like '%Watson%';\n\n-- ordering\nselect name from instructor\nwhere  dept_name = 'Physics'\norder by name;\n\n-- range test\nselect name from instructor\nwhere  salary between 90000 and 100000;",
      bullets: ["as renames relations (correlation variables) and attributes", "like with % (any substring) and _ (any character); escape defines an escape character", "order by … asc / desc sorts the result", "between is shorthand for ≤ and ≥", "select * means all attributes"] },
    { t: "code", title: "3.5 Set operations", side: "Duplicates", code:
"(select course_id from section\n  where semester = 'Fall' and year = 2017)\nunion\n(select course_id from section\n  where semester = 'Spring' and year = 2018);\n\n-- intersect:  in both semesters\n-- except:     Fall 2017 but not Spring 2018",
      bullets: ["union, intersect and except eliminate duplicates", "union all, intersect all and except all keep them", "SQL Server note: union all is supported; intersect all and except all are not"] },
    { t: "table", title: "3.6 Null values and three-valued logic", colW: [2.6, 2.4, 2.4, 2.4, 2.5], head: ["p", "q", "p and q", "p or q", "not p"], rows: [
      ["true", "unknown", "unknown", "true", "false"],
      ["false", "unknown", "false", "unknown", "true"],
      ["unknown", "unknown", "unknown", "unknown", "unknown"],
    ], lead: "Arithmetic with null yields null; a comparison with null yields unknown.", caption: "A where clause keeps a tuple only when its predicate is true; tuples evaluating to false or unknown are dropped. Test for null with is null / is not null." },
    { t: "bullets", title: "Consequences of three-valued logic", bullets: [
      "salary > 50000 or not (salary > 50000) is unknown when salary is null, so such tuples are not returned",
      "Never write = null: the comparison is always unknown; use is null",
      "distinct and set operations treat two nulls as identical values, unlike comparisons in where",
      "SQL also offers is unknown / is not unknown on predicates (SQL Server note: not supported; test the attribute with is null)",
    ], card: { head: "Link to CQ3.1", body: "Under three-valued logic, ‘p OR NOT p’ is not always true. Collect examples of query mistakes that follow from this." } },

    // ---------------- Session 11 ----------------
    { t: "session", n: 11, title: "Aggregate functions and nested subqueries", reading: "DSC Ch. 3, §3.7–3.8, pp. 91–107" },
    { t: "code", title: "3.7 Aggregate functions and group by", side: "Rules", code:
"select avg(salary) as avg_salary\nfrom   instructor\nwhere  dept_name = 'Comp. Sci.';\n\nselect count(distinct ID)\nfrom   teaches\nwhere  semester = 'Spring' and year = 2018;\n\nselect   dept_name, avg(salary) as avg_salary\nfrom     instructor\ngroup by dept_name\nhaving   avg(salary) > 42000;",
      bullets: ["avg, min, max, sum, count; sum and avg need numbers", "Every attribute in select that is not aggregated must appear in group by", "having filters groups after grouping; where filters tuples before"] },
    { t: "bullets", title: "3.7 Aggregation with null values", bullets: [
      "All aggregate functions except count(*) ignore null values in their input",
      "count(*) counts tuples; count(A) counts the non-null values of A",
      "If every input value is null (or the input is empty), count returns 0 and the other aggregates return null",
      "sum(salary) over a column with some nulls adds only the non-null values",
    ], card: { head: "Link to CQ3.3", body: "COUNT(*) and COUNT(attribute) can return different values on the same table. Explain why with an instance that contains nulls." } },
    { t: "code", title: "3.8 Subqueries: membership and comparison", side: "Forms", code:
"-- courses in Fall 2017 and in Spring 2018\nselect distinct course_id from section\nwhere semester = 'Fall' and year = 2017 and\n      course_id in (select course_id from section\n                    where semester = 'Spring' and year = 2018);\n\n-- salary greater than at least one in Biology\nselect name from instructor\nwhere salary > some (select salary from instructor\n                     where dept_name = 'Biology');\n\n-- greater than all in Biology: > all (...)",
      bullets: ["in / not in test set membership", "> some: greater than at least one value; > all: greater than every value", "= some is the same as in; <> all is the same as not in", "SQL Server note: some, any and all are supported"] },
    { t: "code", title: "3.8 exists, from-clause subqueries, with", side: "Notes", code:
"-- correlated subquery with exists\nselect course_id from section as S\nwhere semester = 'Fall' and year = 2017 and\n  exists (select * from section as T\n          where semester = 'Spring' and year = 2018\n            and S.course_id = T.course_id);\n\n-- subquery in the from clause\nselect dept_name, avg_salary\nfrom (select dept_name, avg(salary) as avg_salary\n      from instructor group by dept_name) as D\nwhere avg_salary > 42000;\n\n-- with clause\nwith max_budget(value) as\n  (select max(budget) from department)\nselect dept_name from department, max_budget\nwhere department.budget = max_budget.value;",
      bullets: ["exists is true when the subquery result is non-empty; not exists expresses “for all” (as division does)", "A correlated subquery uses a name from the outer query", "A scalar subquery returns one value and can be used where a value is expected", "SQL Server note: the unique predicate on subqueries is not supported"], codeSize: 11 },
    { t: "bullets", title: "NOT IN versus NOT EXISTS", bullets: [
      "x not in (subquery) is true only if x is different from every value returned",
      "If the subquery returns a null, the comparison x <> null is unknown, so not in is never true and the query returns no rows",
      "not exists only asks whether the subquery returns any row, so a null in another column does not block it",
      "Safer habit: use not exists, or exclude nulls inside the subquery",
    ], card: { head: "Link to CQ3.2", body: "Why does ‘x NOT IN (subquery)’ return no rows when the subquery contains NULL, while NOT EXISTS behaves differently?" } },

    // ---------------- Session 12 ----------------
    { t: "session", n: 12, title: "Modification of the database; translating SQL queries into relational algebra", reading: "DSC Ch. 3, §3.9, pp. 108–113 · Self-study: bag semantics (worksheet)" },
    { t: "code", title: "3.9 Modification of the database", side: "Notes", code:
"delete from instructor\nwhere dept_name = 'Finance';\n\ninsert into course\n  values ('CS-437', 'Database Systems', 'Comp. Sci.', 4);\n\ninsert into instructor\n  select ID, name, dept_name, 18000\n  from   student\n  where  dept_name = 'Music' and tot_cred > 144;\n\nupdate instructor\nset salary = case\n               when salary <= 100000 then salary * 1.05\n               else salary * 1.03\n             end;",
      codeSize: 13,
      bullets: ["delete removes whole tuples; the where clause selects them", "insert can take values or the result of a query; the query is evaluated before any insertion", "update can use case to choose a new value", "Constraints are checked on every modification"] },
    { t: "code", title: "Translating SQL into relational algebra", side: "The basic correspondence", code:
"select A1, A2, ..., An\nfrom   r1, r2, ..., rm\nwhere  P\n\n    corresponds to\n\nΠ A1, A2, ..., An ( σ P ( r1 × r2 × ... × rm ) )\n\n-- example\nselect name\nfrom   instructor, teaches\nwhere  instructor.ID = teaches.ID\n  and  course_id = 'CS-101'\n\nΠ name (σ instructor.ID = teaches.ID ∧ course_id = \"CS-101\"\n         (instructor × teaches))",
      codeSize: 13,
      bullets: ["from → Cartesian product; where → selection; select → projection", "group by / aggregates → the aggregation operator 𝒢", "Exact match holds only with select distinct: algebra works on sets, SQL on multisets (bags)"] },
    { t: "bullets", title: "Self-study: bag (multiset) semantics of SQL", bullets: [
      "SQL tables and query results are multisets: a tuple may occur several times",
      "select keeps duplicates; select distinct removes them; union all keeps them, union removes them",
      "Some algebraic laws of sets fail for bags; for example, in bag semantics r ∪ r is not equal to r",
      "Read DSC Ch. 3, §3.3–3.5 and §3.7 with this question in mind, and complete the worksheet",
    ], card: { head: "Assessment", body: "Bag semantics is self-study. It is assessed in Progress test 1 and in the final exam." } },
    { t: "cq", code: "CQ3.1", question: "Under three-valued logic, ‘p OR NOT p’ is not always true. Which everyday query mistakes follow from this?",
      prompts: ["Find a where clause that silently drops tuples with nulls", "What happens with = null?", "How should the query be rewritten?"], where: ["DSC §3.6 Null values"] },
    { t: "cq", code: "CQ3.2", question: "Why does ‘x NOT IN (subquery)’ return no rows when the subquery contains NULL, while NOT EXISTS behaves differently?",
      prompts: ["Expand not in into a conjunction of <> comparisons", "Evaluate each comparison with a null", "Compare with the definition of not exists"], where: ["DSC §3.6", "DSC §3.8 (set membership, exists)"] },
    { t: "cq", code: "CQ3.3", question: "COUNT(*) and COUNT(attribute) can return different values on the same table. Why, and what does this show about how aggregates treat NULL?",
      prompts: ["Build a three-row instance with one null", "Compute count(*), count(A), sum(A), avg(A)", "Which aggregates ignore nulls?"], where: ["DSC §3.7 Aggregate functions (aggregation with null values)"] },
    { t: "summary", points: [
      "SQL: DDL with types and constraints; DML with select–from–where",
      "Rename, like, order by, between; union / intersect / except",
      "Nulls make comparisons unknown; where keeps only true",
      "Aggregates with group by and having; aggregates ignore nulls except count(*)",
      "Subqueries: in, some / all, exists, from-clause subqueries, with",
      "SQL corresponds to Π σ × of relational algebra, but works on bags",
    ], next: [
      "Choose one of CQ3.1–CQ3.3 and submit an answer within one week",
      "Complete the bag-semantics worksheet",
      "Sessions 13–14: Lab 1 (DSC Ch. 3 Exercises, pp. 115–123)",
    ] },
  ],
};
