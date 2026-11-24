// Chapter 3 – Introduction to SQL (sessions 9–12)
const L = require("../lib");
const { HEX, X0, CW } = L;
const src = (x) => `Source: DSC 7th ed., ${x}`;
const ex = (x) => `Example on the University data (givenDB), checked on the course data; DSC 7th ed., ${x}`;

module.exports = {
  n: 3,
  title: "Introduction to SQL",
  textbook: "DSC Ch. 3, §3.1–3.9, pp. 65–113; self-study: bag semantics (worksheet).",
  clos: ["CLO3", "CLO4"],
  objectives: [
    "Define relations with SQL DDL, including primary and foreign keys",
    "Write select–from–where queries over several relations, with renaming, ordering and set operations",
    "Explain how nulls and three-valued logic affect where clauses, aggregates and not in",
    "Use group by and having, and subqueries with in, some, all and exists",
    "Translate a simple SQL query into relational algebra, and explain bag semantics",
  ],
  sessions: [
    { n: 9, name: "SQL basics", sum: "3.1 overview; 3.2 data definition; 3.3 select–from–where",
      slides: [
        { k: "cards", h: "3.1 The parts of SQL", src: src("§3.1"), cards: [
          ["Data definition (DDL)", "Define, delete and modify relation schemas"],
          ["Data manipulation (DML)", "Query, insert, delete and modify tuples"],
          ["Integrity and views", "Integrity constraints; view definitions"],
          ["Transactions, authorization", "Begin and end transactions; access rights; embedded and dynamic SQL"]] },
        { k: "bul", h: "3.1 SQL and its dialects", src: src("§3.1; SQL Server T-SQL reference"), items: [
          "SQL began as Sequel at IBM in the 1970s",
          "It is standardized by ANSI and ISO (SQL-86 to SQL:2016 and later)",
          "Every product adds its own extensions"],
          right: { card: ["In this course", "SQL Server 2022 and its dialect T-SQL. Where SQL Server differs from the standard, the slides say so."] } },
        { k: "table", h: "3.2 Basic domain types", src: src("§3.2; SQL Server data types"), size: 20, rowH: 0.66, colW: [3.0, 5.5, 3.63], rows: [
          ["Type", "Meaning", "SQL Server"],
          ["char(n)", "Fixed-length string of length n", "char(n), nchar(n)"],
          ["varchar(n)", "Variable-length string, maximum n", "varchar(n), nvarchar(n)"],
          ["int, smallint", "Integers", "int, smallint, bigint"],
          ["numeric(p, d)", "p digits, d of them after the point", "numeric, decimal"],
          ["real, float(n)", "Floating-point numbers", "real, float(n)"]],
          note: "Every type includes the value null unless the attribute is declared not null." },
        { k: "code", h: "3.2 Schema definition", src: src("§3.2; same definitions as university_sqlserver.sql"), codeW: 7.0, code:
"create table department\n (dept_name varchar(20),\n  building  varchar(15),\n  budget    numeric(12,2),\n  primary key (dept_name));\n\ncreate table instructor\n (ID        varchar(5),\n  name      varchar(20) not null,\n  dept_name varchar(20),\n  salary    numeric(8,2),\n  primary key (ID),\n  foreign key (dept_name)\n    references department);",
          items: ["primary key: non-null and unique", "foreign key: values must exist in department", "not null: no null allowed"] },
        { k: "cards", h: "3.2 Constraints and schema changes", src: src("§3.2"), cards: [
          ["Constraints are enforced", "SQL rejects any insert or update that violates a constraint"],
          ["drop table r", "Deletes r: its schema and all its tuples"],
          ["alter table r add A D", "Adds attribute A of domain D; existing tuples get null"],
          ["alter table r drop A", "Removes attribute A (not supported by every product)"]] },
        { k: "code", h: "3.3 The select–from–where query", src: ex("§3.3"), codeW: 7.0, code:
"select name\nfrom   instructor\nwhere  dept_name = 'Comp. Sci.'\n  and  salary > 70000;\n\n-- result: Nguyen, Tran",
          items: ["select: the attributes of the result", "from: the relations to read", "where: a predicate on the tuples", "Keywords are not case sensitive"] },
        { k: "code", h: "3.3 Duplicates and expressions", src: ex("§3.3"), codeW: 7.0, code:
"select dept_name from instructor;\n-- 12 rows, with duplicates\n\nselect distinct dept_name\nfrom   instructor;\n-- 5 rows\n\nselect ID, name, salary * 1.1\nfrom   instructor;",
          items: ["SQL keeps duplicates by default", "distinct removes them; all keeps them explicitly", "select may contain arithmetic expressions"] },
        { k: "code", h: "3.3 Queries on several relations", src: ex("§3.3"), codeW: 7.6, code:
"select name, instructor.dept_name,\n       building\nfrom   instructor, department\nwhere  instructor.dept_name\n         = department.dept_name;\n\nselect name, course_id\nfrom   instructor, teaches\nwhere  instructor.ID = teaches.ID;",
          items: ["Qualify ambiguous names with the relation name", "Without the where clause: every pair of tuples"] },
        { k: "draw", h: "3.3 How a query is evaluated (conceptually)", src: "Diagram drawn for IDB201 after DSC 7th ed., §3.3", draw: (s) => {
          [["from", "Cartesian product of the relations"], ["where", "keep the tuples whose predicate is true"], ["select", "output the listed attributes (keep duplicates)"]].forEach((c, i) => {
            const x = 0.7 + i * 4.2;
            L.node(s, c[0], x, 1.8, 3.4, 1.0, { fill: i === 1 ? HEX.paleOrange : HEX.white, mono: true });
            L.text(s, c[1], x, 3.0, 3.4, 1.4, { fontSize: 22, align: "center" });
            if (i < 2) L.arrow(s, x + 3.4, 2.3, x + 4.2, 2.3, { color: HEX.orange });
          });
          L.autoCard(s, X0, 4.8, CW, 1.7, null, "This describes the result, not how a system computes it: real systems use joins and indexes (Chapter 9).", "eval", { fill: HEX.pale });
        } },
      ] },
    { n: 10, name: "Operations and nulls", sum: "3.4 rename, like, order by; 3.5 set operations; 3.6 nulls",
      slides: [
        { k: "code", h: "3.4 Rename with as", src: ex("§3.4.1"), codeW: 7.6, code:
"select distinct T.name\nfrom   instructor as T,\n       instructor as S\nwhere  T.salary > S.salary\n  and  S.dept_name = 'Biology';\n\n-- Nguyen, Tran, Pham, Curie,\n-- Bohr, Keynes",
          items: ["as renames a relation (a correlation variable) or an attribute", "Needed to compare a relation with itself", "SQL Server: as may be omitted for relations"] },
        { k: "code", h: "3.4 String matching", src: ex("§3.4.2"), codeW: 7.0, code:
"select dept_name\nfrom   department\nwhere  building like '%Alpha%';\n\n-- Comp. Sci., Philosophy",
          items: ["% matches any substring", "_ matches any single character", "escape '\\' lets you search for % itself", "Comparison is case sensitive in the standard; SQL Server depends on the collation"] },
        { k: "code", h: "3.4 Ordering and ranges", src: ex("§3.4.4–3.4.5"), codeW: 7.0, code:
"select name from instructor\nwhere  dept_name = 'Physics'\norder by name;          -- Bohr, Curie\n\nselect name from instructor\nwhere  salary between 90000\n               and 100000;\n-- Nguyen, Curie",
          items: ["order by … asc (default) or desc", "Several keys: order by salary desc, name asc", "between is shorthand for ≥ and ≤"] },
        { k: "code", h: "3.5 Set operations", src: ex("§3.5"), codeW: 7.6, code:
"(select course_id from section\n where semester = 'Fall'\n   and year = 2025)\nunion\n(select course_id from section\n where semester = 'Spring'\n   and year = 2026);\n\n-- intersect: in both terms (CS-101)\n-- except: Fall 2025 only",
          items: ["union, intersect, except remove duplicates", "union all, intersect all, except all keep them", "SQL Server: no intersect all, except all"] },
        { k: "draw", h: "union and union all", src: "Example written for IDB201 on DSC 7th ed., §3.5", draw: (s) => {
          L.text(s, "r", 0.8, 1.45, 1.6, 0.5, { bold: true, color: HEX.navy, align: "center" });
          L.table(s, [["A"], ["1"], ["1"], ["2"]], 0.8, 2.0, 1.6, { mono: true, size: 20, rowH: 0.55 });
          L.text(s, "s", 2.8, 1.45, 1.6, 0.5, { bold: true, color: HEX.navy, align: "center" });
          L.table(s, [["A"], ["2"], ["3"]], 2.8, 2.0, 1.6, { mono: true, size: 20, rowH: 0.55 });
          L.text(s, "r union s", 5.3, 1.45, 2.6, 0.5, { bold: true, color: HEX.navy, align: "center", fontFace: L.CODE, fontSize: 20 });
          L.table(s, [["A"], ["1"], ["2"], ["3"]], 5.8, 2.0, 1.6, { mono: true, size: 20, rowH: 0.55 });
          L.text(s, "r union all s", 8.4, 1.45, 3.0, 0.5, { bold: true, color: HEX.navy, align: "center", fontFace: L.CODE, fontSize: 20 });
          L.table(s, [["A"], ["1"], ["1"], ["2"], ["2"], ["3"]], 9.1, 2.0, 1.6, { mono: true, size: 20, rowH: 0.55 });
          L.autoCard(s, X0, 5.55, CW, 1.05, null, "union all keeps every copy: m + n copies of a tuple that occurs m times in r and n times in s.", "unionall", { fill: HEX.paleOrange });
        } },
        { k: "bul", h: "3.6 Null values", src: src("§3.6"), items: [
          "Arithmetic with null gives null: salary * 1.1 is null if salary is null",
          "A comparison with null gives unknown: null > 50000, null = null",
          "Test with is null / is not null",
          "Never write = null: it is always unknown"],
          right: { card: ["On University", "Dang (I9000, Biology) has a null salary: watch where this instructor appears in the results of this chapter."] } },
        { k: "table", h: "3.6 Three-valued logic", src: src("§3.6"), size: 22, rowH: 0.7, colW: [2.2, 2.2, 2.6, 2.6, 2.53], rows: [
          ["p", "q", "p and q", "p or q", "not p"],
          ["true", "unknown", "unknown", "true", "false"],
          ["false", "unknown", "false", "unknown", "true"],
          ["unknown", "unknown", "unknown", "unknown", "unknown"]],
          note: "A where clause keeps a tuple only when its predicate is true; false and unknown are dropped." },
        { k: "cards", h: "Consequences of three-valued logic", src: src("§3.6"), cards: [
          ["p or not p", "salary > 50000 or not (salary > 50000) is unknown when salary is null: Dang is not returned"],
          ["= null", "Always unknown: write is null"],
          ["Duplicates", "distinct and set operations treat two nulls as the same value"],
          ["SQL Server", "is unknown on predicates is not supported: test the attribute with is null", HEX.paleOrange]] },
        { k: "quick", h: "Quick check: session 10", src: "Questions written for IDB201 on DSC 7th ed., §3.4–3.6",
          qs: ["Which pattern finds the department names that end in 's'?",
               "How many rows does (select 1) union (select 1) return? And with union all?",
               "What is the value of null = null in a where clause, and is the tuple kept?"],
          ans: "1 like '%s'; 2 one row, two rows; 3 unknown, the tuple is not kept." },
      ] },
    { n: 11, name: "Aggregates and subqueries", sum: "3.7 aggregate functions; 3.8 nested subqueries",
      slides: [
        { k: "code", h: "3.7 Aggregate functions", src: ex("§3.7"), codeW: 7.0, code:
"select avg(salary) as avg_salary\nfrom   instructor\nwhere  dept_name = 'Comp. Sci.';\n-- 70000\n\nselect count(distinct ID)\nfrom   teaches\nwhere  semester = 'Spring'\n  and  year = 2026;\n-- 6",
          items: ["avg, min, max, sum, count", "sum and avg need numbers", "count(distinct A) counts different values"] },
        { k: "code", h: "3.7 group by and having", src: ex("§3.7.2–3.7.3"), codeW: 6.6, code:
"select   dept_name,\n         avg(salary) as avg_salary\nfrom     instructor\ngroup by dept_name\nhaving   avg(salary) > 74000;",
          card: ["Result", "Mathematics 74500, Physics 89000. Every attribute in select that is not aggregated must appear in group by."] },
        { k: "draw", h: "3.7 Order of evaluation with groups", src: "Diagram drawn for IDB201 after DSC 7th ed., §3.7.3", draw: (s) => {
          ["from", "where", "group by", "having", "select"].forEach((t, i) => {
            const x = 0.6 + i * 2.5;
            L.node(s, t, x, 2.0, 2.1, 0.9, { mono: true, fill: i === 1 || i === 3 ? HEX.paleOrange : HEX.white });
            if (i < 4) L.arrow(s, x + 2.1, 2.45, x + 2.5, 2.45, { color: HEX.orange });
          });
          L.text(s, "filters tuples", 3.1, 3.05, 2.1, 0.5, { fontSize: 18, align: "center", color: HEX.grey });
          L.text(s, "filters groups", 8.1, 3.05, 2.1, 0.5, { fontSize: 18, align: "center", color: HEX.grey });
          L.autoCard(s, X0, 4.2, CW, 2.3, "Rule of thumb", "A condition on single tuples goes in where; a condition on an aggregate goes in having.", "groups", { fill: HEX.pale });
        } },
        { k: "code", h: "3.7 Aggregation with null values", src: ex("§3.7.4"), codeW: 7.0, code:
"select count(*),\n       count(salary),\n       avg(salary)\nfrom   instructor;\n\n-- 12, 11, 74272.73",
          items: ["All aggregates except count(*) ignore nulls", "count(*) counts tuples; count(A) counts non-null values of A", "On an empty input, count gives 0 and the others null"] },
        { k: "code", h: "3.8 Set membership: in", src: ex("§3.8.1"), codeW: 7.6, code:
"select distinct course_id\nfrom   section\nwhere  semester = 'Fall'\n  and  year = 2025\n  and  course_id in\n       (select course_id\n        from   section\n        where  semester = 'Spring'\n          and  year = 2026);\n-- CS-101",
          items: ["in tests membership in a set", "not in tests absence", "The same query can be written with intersect"] },
        { k: "code", h: "3.8 Set comparison: some and all", src: ex("§3.8.2"), codeW: 7.6, code:
"select name\nfrom   instructor\nwhere  salary > some\n       (select salary\n        from   instructor\n        where  dept_name = 'Biology');\n\n-- Nguyen, Tran, Pham, Curie,\n-- Bohr, Keynes",
          items: ["> some: greater than at least one value", "> all: greater than every value", "= some is in; <> all is not in"] },
        { k: "code", h: "3.8 exists and correlated subqueries", src: src("§3.8.3"), codeW: 7.6, code:
"select course_id\nfrom   section as S\nwhere  semester = 'Fall'\n  and  year = 2025\n  and  exists\n   (select *\n    from   section as T\n    where  semester = 'Spring'\n      and  year = 2026\n      and  S.course_id = T.course_id);",
          items: ["exists: the subquery returns at least one row", "Correlated: the subquery uses a name of the outer query (S)", "not exists expresses “for all” (CQ2.2)"] },
        { k: "code", h: "3.8 Subqueries in from, and with", src: ex("§3.8.4–3.8.6"), codeW: 7.6, code:
"select dept_name, avg_salary\nfrom  (select dept_name,\n              avg(salary) as avg_salary\n       from instructor\n       group by dept_name) as D\nwhere  avg_salary > 74000;\n\nwith max_budget(value) as\n  (select max(budget) from department)\nselect dept_name\nfrom   department, max_budget\nwhere  budget = max_budget.value;",
          items: ["A from-clause subquery gives a temporary relation", "with names it for one query", "Second query: Comp. Sci."] },
        { k: "cards", h: "not in versus not exists", src: src("§3.6, §3.8"), cards: [
          ["not in", "x not in (1, null) means x <> 1 and x <> null: the second part is unknown, so no row is returned"],
          ["not exists", "Asks only whether a matching row exists: a null in another row does not block it"],
          ["Safer habit", "Use not exists, or exclude nulls inside the subquery (where B is not null)", HEX.paleOrange]] },
      ] },
    { n: 12, name: "Modification and semantics", sum: "3.9 delete, insert, update; SQL to relational algebra; CQ3.1–CQ3.3",
      slides: [
        { k: "code", h: "3.9 Deletion and insertion", src: src("§3.9.1–3.9.2"), codeW: 7.6, code:
"delete from instructor\nwhere  dept_name = 'Philosophy';\n\ninsert into course\n values ('CS-437', 'Database Systems',\n         'Comp. Sci.', 4);\n\ninsert into instructor\n select ID, name, dept_name, 30000\n from   student\n where  dept_name = 'Physics'\n   and  tot_cred > 20;",
          items: ["delete removes whole tuples", "insert takes values or a query result", "The query is evaluated before anything is inserted"] },
        { k: "code", h: "3.9 Update with case", src: src("§3.9.3"), codeW: 7.6, code:
"update instructor\nset salary = case\n  when salary <= 100000\n    then salary * 1.05\n  else salary * 1.03\nend;",
          items: ["One statement, so the order of two updates cannot matter", "With two separate updates, a salary just below the limit could be raised twice", "Constraints are checked on every change"] },
        { k: "code", h: "From SQL to relational algebra", src: src("§3.3; translation of select–from–where"), codeW: 8.2, code:
"select A1, …, An\nfrom   r1, …, rm\nwhere  P\n\n  corresponds to\n\nΠ A1, …, An (σ P (r1 × … × rm))",
          items: ["from → ×", "where → σ", "select → Π", "group by → 𝒢"] },
        { k: "draw", h: "A query as an expression tree", src: "Diagram drawn for IDB201 after DSC 7th ed., §3.3", draw: (s) => {
          L.code(s, "select name, course_id\nfrom   instructor, teaches\nwhere  instructor.ID = teaches.ID;", X0, 1.45, 6.2, 1.5, { size: 18 });
          L.node(s, "Π name, course_id", 7.9, 1.5, 3.8, 0.8);
          L.node(s, "σ instructor.ID = teaches.ID", 7.5, 2.9, 4.6, 0.8);
          L.node(s, "×", 9.2, 4.3, 1.2, 0.8, { shape: "ellipse" });
          L.node(s, "instructor", 7.4, 5.6, 2.4, 0.8, { fill: HEX.pale }); L.node(s, "teaches", 9.9, 5.6, 2.4, 0.8, { fill: HEX.pale });
          L.arrow(s, 9.8, 2.9, 9.8, 2.3); L.arrow(s, 9.8, 4.3, 9.8, 3.7); L.arrow(s, 8.6, 5.6, 9.4, 5.0); L.arrow(s, 11.1, 5.6, 10.2, 5.0);
          L.autoCard(s, X0, 3.3, 6.2, 3.1, null, "from gives ×, where gives σ, select gives Π. The optimizer later replaces σ over × by a join (Chapter 9).", "tree", { fill: HEX.paleOrange });
        } },
        { k: "cards", h: "Sets in the algebra, bags in SQL", src: src("§3.3; DSC note on multisets"), cards: [
          ["Relational algebra", "Works on sets: every result is duplicate-free"],
          ["SQL", "Works on bags (multisets): a tuple can occur many times"],
          ["Exact match", "The translation is exact only with select distinct", HEX.paleOrange]] },
        { k: "cards", h: "Self-study: bag semantics", src: "Self-study source: DSC 7th ed., §3.3–3.5 and §3.7; bag-semantics worksheet", cards: [
          ["Read", "§3.3–3.5 and §3.7 with the question: what changes when duplicates are kept?"],
          ["Example", "In bag semantics r union all r has twice as many tuples as r, so r ∪ r = r no longer holds"],
          ["Worksheet", "Complete the bag-semantics worksheet; assessed in Progress test 1 and the final exam", HEX.paleOrange]] },
        { k: "cq", id: "CQ3.1", look: "Where to look: DSC 7th ed., §3.6", prompts: [
          "Find a where clause that silently drops the tuples with nulls",
          "What happens with = null?",
          "How should such queries be rewritten?"] },
        { k: "cq", id: "CQ3.2", look: "Where to look: DSC 7th ed., §3.6, §3.8", prompts: [
          "Expand not in into a conjunction of <> comparisons",
          "Evaluate each comparison when the subquery returns a null",
          "Compare with the definition of not exists"] },
        { k: "cq", id: "CQ3.3", look: "Where to look: DSC 7th ed., §3.7.4", prompts: [
          "Build a three-row instance with one null",
          "Compute count(*), count(A), sum(A) and avg(A)",
          "Which aggregates ignore nulls, and why?"] },
      ] },
  ],
  back: [
    { k: "list", h: "Practice exercises", src: "Exercises written for IDB201; more: bag-semantics worksheet and DSC Practice Exercises 3.1–3.11, pp. 114–117", items: [
      "Find the departments whose average salary is higher than the average salary of all instructors.",
      "Find the students who have not taken any course.",
      "Predict the three values of: select count(*), count(salary), avg(salary) from instructor. Then run it."] },
    { k: "list", h: "Practice exercises: answers", src: "Answers checked on the University data (givenDB); DSC 7th ed., §3.7–3.8", fill: HEX.pale, items: [
      "group by dept_name having avg(salary) > (select avg(salary) from instructor): Mathematics 74500 and Physics 89000.",
      "select ID, name from student s where not exists (select * from takes t where t.ID = s.ID): S0004 Dung, S0019 Yen.",
      "12, 11, 74272.73: count(*) counts all rows; count(salary) and avg(salary) ignore Dang's null salary."] },
    { k: "cards", h: "Summary", src: "DSC 7th ed., Ch. 3", cols: 3, num: false, cards: [
      ["DDL", "Types, primary and foreign keys, not null"],
      ["Queries", "select–from–where; as, like, order by, between"],
      ["Set operations", "union, intersect, except; all keeps duplicates"],
      ["Nulls", "Comparisons give unknown; where keeps only true"],
      ["Aggregates", "group by, having; nulls ignored except by count(*)"],
      ["Subqueries", "in, some, all, exists, from-clause, with", HEX.paleOrange]] },
    { k: "cards", h: "Before the next session", src: "IDB201 syllabus, sessions 12–15", cards: [
      ["Within one week", "Choose one of CQ3.1–CQ3.3 and submit your answer on the LMS"],
      ["Sessions 13–14", "Lab 1: SQL queries on University (DSC Ch. 3 Exercises, pp. 115–123)", HEX.paleOrange],
      ["Session 15", "Read DSC Ch. 4, §4.1–4.2, pp. 125–142"]] },
  ],
};
