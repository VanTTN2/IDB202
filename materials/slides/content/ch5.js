// Chapter 5 – Programming the database (sessions 18, 19, 20, 21, 22, 23)
module.exports = {
  num: 5,
  title: "Programming the database: SQL from programs and T-SQL",
  short: "Programming the database",
  sessions: [18, 19, 20, 21, 22, 23],
  reading: "§5.1–5.3, pp. 183–212; T-SQL reference",
  slides: [
    { t: "outline", title: "Chapter 5 roadmap", items: [
      { session: "18", head: "SQL from programs", points: ["5.1 APIs, cursors, prepared statements", "SQL injection and parameters", "CQ4.1–CQ4.3"] },
      { session: "19", head: "Lab 2", points: ["DDL, integrity constraints, views and parameterized queries"] },
      { session: "20–21", head: "Functions, procedures", points: ["T-SQL batches, variables, IF, WHILE", "Scalar and table-valued functions", "Procedures, TRY…CATCH"] },
      { session: "22–23", head: "Triggers, cursors", points: ["AFTER and INSTEAD OF triggers", "Cursors: row-by-row vs. set-based"] },
    ] },

    // ---------------- Session 18 ----------------
    { t: "session", n: 18, title: "Accessing SQL from a programming language: APIs, cursors, prepared statements; SQL injection and parameterized queries", reading: "DSC §5.1, pp. 183–197 · Self-study: §9.8 Application security, pp. 437–446; Python access to SQL Server (optional)" },
    { t: "cards", title: "5.1 Accessing SQL from a programming language", lead: "SQL is not a general-purpose language, so applications combine a host language with SQL.", items: [
      { head: "Dynamic SQL through an API", body: "The program builds SQL at run time and sends it through an API: JDBC (Java), ODBC (C and others), Python database APIs." },
      { head: "Embedded SQL", body: "SQL statements are written inside the host program and translated by a preprocessor at compile time." },
      { head: "Connect, execute, fetch", body: "Open a connection, execute statements, iterate over the result rows, handle exceptions, close the connection." },
    ] },
    { t: "twocol", title: "Cursors and prepared statements", left: { head: "Cursor (result iteration)", items: [
      "A query result is a set; the host program processes it one row at a time",
      "The API returns a result object that is advanced row by row (e.g. ResultSet.next() in JDBC)",
      "The same idea appears as T-SQL cursors in session 23",
    ] }, right: { head: "Prepared statements", items: [
      "The SQL text contains placeholders (?) for values",
      "The statement is compiled once and executed many times with different values",
      "Values are passed as parameters, never pasted into the SQL text",
    ] } },
    { t: "code", title: "SQL injection", side: "What goes wrong", code:
"-- program builds the query by concatenation:\n\"select * from instructor where name = '\" + name + \"'\"\n\n-- the user types as name:\nX' or 'Y' = 'Y\n\n-- the query that is executed:\nselect * from instructor\nwhere name = 'X' or 'Y' = 'Y'\n\n-- the where clause is always true:\n-- every instructor is returned",
      bullets: ["The input changes the structure of the query, not just a value", "Worse inputs can modify or delete data", "Defense: prepared statements / parameters, so the input is always treated as a value", "Example follows DSC §5.1 (prepared statements)"] },
    { t: "code", title: "Parameterized queries in T-SQL", side: "Notes", code:
"declare @dept varchar(20) = N'Physics';\n\n-- static SQL with a variable: safe\nselect name from instructor where dept_name = @dept;\n\n-- dynamic SQL with a parameter: safe\nexec sp_executesql\n  N'select name from instructor where dept_name = @d',\n  N'@d varchar(20)',\n  @d = @dept;\n\n-- dynamic SQL by concatenation: UNSAFE\n-- exec ('select name from instructor\n--        where dept_name = ''' + @dept + '''');",
      bullets: ["sp_executesql takes the SQL text, the parameter declarations and the values separately", "Concatenating user input into exec(…) reopens the injection risk", "Self-study (session 21): dynamic SQL with sp_executesql"] },
    { t: "cq", code: "CQ4.1", question: "Why should integrity rules be declared in the database rather than checked in application code? When is the opposite true?",
      prompts: ["How many applications use the same database?", "Which rules cannot be declared as constraints?", "Who notices a violation, and when?"], where: ["DSC §4.4 Integrity constraints", "DSC §5.3 Triggers"] },
    { t: "cq", code: "CQ4.2", question: "A view costs nothing extra at run time. How is that possible, and when would a materialized view be better?",
      prompts: ["What does the system store for a view?", "What is view expansion?", "Trade-off: query speed vs. storage and maintenance"], where: ["DSC §4.2 Views (materialized views)"] },
    { t: "cq", code: "CQ4.3", question: "Why do parameterized queries prevent SQL injection, while escaping user input is considered fragile?",
      prompts: ["When is the structure of the query fixed?", "What must an escaping routine get right for every input?", "Relate to the example on the injection slide"], where: ["DSC §5.1 (prepared statements, SQL injection)", "Self-study: DSC §9.8"] },

    // ---------------- Session 19 ----------------
    { t: "session", n: 19, title: "Lab 2: DDL, integrity constraints, views and parameterized queries", reading: "DSC Ch. 4 Exercises, pp. 176–179; §5.1" },
    { t: "cards", title: "Lab 2 overview", items: [
      { head: "Define", body: "Create tables with primary keys, foreign keys, unique, not null and check constraints." },
      { head: "Test", body: "Show each constraint rejecting an invalid insert or update, and explain the error." },
      { head: "View", body: "Create views, query them, and test an update through a view with check option." },
      { head: "Parameterize", body: "Rewrite an injection-prone dynamic query with sp_executesql and parameters (Investigate)." },
    ], notes: "Details, rubric and submission format are in the Lab 2 handout. Submit before the end of the session." },

    // ---------------- Session 20 ----------------
    { t: "session", n: 20, title: "Functions and procedures (1): T-SQL batches, variables and control flow; scalar and table-valued user-defined functions", reading: "DSC §5.2 (within pp. 198–212); T-SQL reference: control-of-flow language, CREATE FUNCTION" },
    { t: "code", title: "T-SQL batches, variables and control flow", side: "Building blocks", code:
"declare @n int = 0, @total numeric(12,2);\n\nselect @total = sum(budget) from department;\n\nif @total > 1000000\n    print 'Large total budget';\nelse\n    print 'Small total budget';\n\nwhile @n < 3\nbegin\n    set @n = @n + 1;\n    print @n;\nend\ngo   -- batch separator in SSMS",
      bullets: ["declare / set / select @v = … assign variables", "begin … end groups statements", "if … else and while give procedural control", "go ends a batch (an SSMS command, not T-SQL)", "DSC §5.2 describes the same constructs in standard SQL/PSM"] },
    { t: "code", title: "Scalar user-defined function", side: "DSC §5.2 example in T-SQL", code:
"create function dbo.dept_count (@dept_name varchar(20))\nreturns int\nas\nbegin\n    declare @d_count int;\n    select @d_count = count(*)\n    from   instructor\n    where  instructor.dept_name = @dept_name;\n    return @d_count;\nend;\ngo\n\n-- departments with more than 12 instructors\nselect dept_name, budget\nfrom   department\nwhere  dbo.dept_count(dept_name) > 12;",
      bullets: ["A scalar function returns one value", "It can be used wherever an expression is allowed", "Call it with its schema name (dbo.)", "Functions may not modify the database"], codeSize: 13 },
    { t: "code", title: "Table-valued user-defined function", side: "Notes", code:
"create function dbo.instructor_of (@dept_name varchar(20))\nreturns table\nas\nreturn (\n    select ID, name, dept_name, salary\n    from   instructor\n    where  instructor.dept_name = @dept_name\n);\ngo\n\nselect *\nfrom   dbo.instructor_of('Finance');",
      bullets: ["Returns a relation, so it is used in the from clause", "Behaves like a parameterized view", "Inline table-valued functions can be optimized together with the calling query"] },

    // ---------------- Session 21 ----------------
    { t: "session", n: 21, title: "Functions and procedures (2): stored procedures, TRY…CATCH, transactions inside a procedure", reading: "DSC §5.2 (within pp. 198–212); T-SQL reference: CREATE PROCEDURE, TRY…CATCH · Self-study: dynamic SQL with sp_executesql" },
    { t: "code", title: "Stored procedures with input and output parameters", side: "Notes", code:
"create procedure dbo.dept_count_proc\n    @dept_name varchar(20),\n    @d_count   int output\nas\nbegin\n    select @d_count = count(*)\n    from   instructor\n    where  dept_name = @dept_name;\nend;\ngo\n\ndeclare @c int;\nexec dbo.dept_count_proc 'Physics', @c output;\nprint @c;",
      bullets: ["A procedure is invoked with exec, not inside a query", "output parameters return values to the caller", "Procedures may modify the database and contain transactions", "The DSC version uses SQL/PSM syntax: in and out parameters, call"] },
    { t: "code", title: "Error handling and transactions in a procedure", side: "Pattern", code:
"create procedure dbo.transfer_budget @from varchar(20),\n    @to varchar(20), @amount numeric(12,2)\nas\nbegin\n  begin try\n    begin transaction;\n      update department set budget = budget - @amount\n      where  dept_name = @from;\n      update department set budget = budget + @amount\n      where  dept_name = @to;\n    commit transaction;\n  end try\n  begin catch\n    if @@trancount > 0 rollback transaction;\n    throw;   -- re-raise the error to the caller\n  end catch\nend;",
      bullets: ["Both updates take effect, or neither does (atomicity)", "An error inside try jumps to catch", "@@trancount tells whether a transaction is open", "throw re-raises; error_message() reads the message", "Transactions in depth: Chapter 10"], codeSize: 12 },

    // ---------------- Session 22 ----------------
    { t: "session", n: 22, title: "Triggers: AFTER and INSTEAD OF; the inserted and deleted tables; business rules; when not to use triggers", reading: "DSC §5.3 (within pp. 198–212); T-SQL reference: CREATE TRIGGER" },
    { t: "bullets", title: "5.3 Triggers: the event–condition–action model", bullets: [
      "A trigger is a statement executed automatically by the system as a side effect of a modification",
      "It specifies an event (insert, delete, update), a condition and an action",
      "Uses: enforce rules that keys and check constraints cannot express; keep derived data up to date; write audit logs",
      "Standard SQL has before and after triggers, at row level (for each row) or statement level",
      "SQL Server: after and instead of triggers, fired once per statement; the affected rows are in the inserted and deleted tables",
    ], card: { head: "inserted and deleted", body: "insert: new rows in inserted\ndelete: old rows in deleted\nupdate: old rows in deleted, new rows in inserted" } },
    { t: "code", title: "AFTER trigger: maintaining tot_cred", side: "DSC §5.3 example in T-SQL", code:
"create trigger dbo.credits_earned on takes\nafter update\nas\nbegin\n  update s\n  set    tot_cred = s.tot_cred + c.credits\n  from   student s\n  join   inserted i on s.ID = i.ID\n  join   deleted  d on d.ID = i.ID and d.course_id = i.course_id\n                   and d.sec_id = i.sec_id\n                   and d.semester = i.semester and d.year = i.year\n  join   course c on c.course_id = i.course_id\n  where  i.grade <> 'F' and i.grade is not null\n    and  (d.grade = 'F' or d.grade is null);\nend;",
      bullets: ["Fires when grades are updated", "Adds credits when a grade changes from F or null to a passing grade", "Written set-based so that one statement updating many rows is handled correctly", "The DSC version is a row-level trigger (for each row)"], codeSize: 12 },
    { t: "code", title: "INSTEAD OF trigger on a view", side: "Notes", code:
"create view dbo.faculty as\n  select ID, name, dept_name from instructor;\ngo\n\ncreate trigger dbo.faculty_insert on dbo.faculty\ninstead of insert\nas\nbegin\n  insert into instructor (ID, name, dept_name, salary)\n  select ID, name, dept_name, null\n  from   inserted;\nend;",
      bullets: ["Replaces the triggering statement with the trigger's action", "Lets a view accept inserts that the system could not translate on its own", "Here the missing salary is set to null; a real rule might use a default"] },
    { t: "twocol", title: "When not to use triggers", left: { head: "Risks", items: [
      "Hidden logic: the effect of a statement is no longer visible in the statement",
      "Cascading triggers: one trigger fires another, possibly in a loop",
      "Loading data or restoring a backup may fire triggers unintentionally",
    ] }, right: { head: "Prefer instead", items: [
      "Declarative constraints (keys, foreign keys, check) when they can express the rule",
      "Built-in features, e.g. cascading foreign-key actions and materialized (indexed) views",
      "Stored procedures that perform a business operation explicitly",
    ] }, notes: "DSC §5.3 discusses when not to use triggers; the list above follows that discussion." },

    // ---------------- Session 23 ----------------
    { t: "session", n: 23, title: "Cursors: from the cursor concept of §5.1 to T-SQL cursors; row-by-row versus set-based processing", reading: "DSC §5.1 (cursors, revisited), §5.2 (loops over query results); T-SQL reference: DECLARE CURSOR, FETCH" },
    { t: "code", title: "A T-SQL cursor", side: "Life cycle", code:
"declare @id varchar(5), @salary numeric(8,2);\n\ndeclare c cursor for\n    select ID, salary from instructor\n    where  dept_name = 'Music';\n\nopen c;\nfetch next from c into @id, @salary;\nwhile @@fetch_status = 0\nbegin\n    update instructor set salary = @salary * 1.05\n    where  ID = @id;\n    fetch next from c into @id, @salary;\nend;\nclose c;\ndeallocate c;",
      bullets: ["declare … cursor for <query>", "open, then fetch next into variables", "@@fetch_status = 0 while a row was fetched", "close and deallocate when finished"], codeSize: 13 },
    { t: "twocol", title: "Row-by-row versus set-based processing", lead: "The cursor above does the same work as one statement:  update instructor set salary = salary * 1.05 where dept_name = 'Music';",
      left: { head: "Cursor (row by row)", items: [
        "One statement per row, with fetch overhead each time",
        "The optimizer sees only single-row updates",
        "Justified when each row needs a different procedural action, e.g. calling a procedure per row",
      ] }, right: { head: "Set-based SQL", items: [
        "One declarative statement for all rows",
        "The optimizer chooses the access path for the whole set",
        "Usually much faster and shorter; the default choice",
      ] }, notes: "Lab 3 part 2 asks students to measure a cursor solution against a set-based one on the same task." },
    { t: "summary", points: [
      "Programs reach SQL through APIs or embedded SQL; cursors iterate over results",
      "Parameters (prepared statements, sp_executesql) prevent SQL injection",
      "T-SQL adds variables, control flow, functions and procedures",
      "TRY…CATCH with transactions makes a procedure all-or-nothing",
      "Triggers react to modifications through inserted and deleted; use them sparingly",
      "Prefer set-based SQL; use cursors only when needed",
    ], next: [
      "Choose one of CQ4.1–CQ4.3 and submit an answer within one week",
      "Self-study: §9.8 Application security; dynamic SQL with sp_executesql",
      "Sessions 24–25: Lab 3; session 26: Progress test 1 (Chapters 1–5)",
    ] },
  ],
};
