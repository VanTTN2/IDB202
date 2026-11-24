// Chapter 5 – Programming the database in T-SQL (sessions 20–23; session 19 is Lab 2)
const L = require("../lib");
const { HEX, X0, CW } = L;
const tref = (x) => `Source: DSC 7th ed., ${x}; SQL Server T-SQL reference`;
const ex = (x) => `Example on the University data (givenDB), checked on the course data; DSC 7th ed., ${x}; T-SQL reference`;

module.exports = {
  n: 5,
  title: "Programming the database in T-SQL",
  textbook: "DSC §5.1–5.3, pp. 183–212 (functions, procedures, triggers, cursors); SQL Server T-SQL reference.",
  clos: ["CLO2", "CLO4"],
  objectives: [
    "Write T-SQL batches with variables, if and while",
    "Write scalar and table-valued functions and stored procedures with parameters",
    "Handle errors with try…catch and use a transaction inside a procedure",
    "Write set-based after and instead of triggers with the inserted and deleted tables",
    "Decide when a cursor is justified, and rewrite row-by-row code as one set-based statement",
  ],
  roadNote: "Session 19: Lab 2 · Sessions 24–25: Lab 3 · Session 26: Progress test 1 (Chapters 1–5)",
  sessions: [
    { n: 20, name: "Functions", sum: "T-SQL batches, variables, if, while; scalar and table-valued functions",
      slides: [
        { k: "cards", h: "Programming inside the database", src: tref("§5.2"), cards: [
          ["Standard", "DSC §5.2 uses SQL/PSM: functions, procedures, loops in standard SQL"],
          ["SQL Server", "T-SQL implements the same ideas with its own syntax"],
          ["Why", "Business logic runs next to the data and is shared by every application"],
          ["This chapter", "Functions, procedures, triggers and cursors", HEX.paleOrange]] },
        { k: "code", h: "T-SQL batches and variables", src: tref("§5.2"), codeW: 7.4, code:
"declare @n int = 0,\n        @total numeric(12,2);\n\nselect @total = sum(budget)\nfrom   department;     -- 455000\n\nset @n = @n + 1;\nprint @total;\ngo   -- batch separator in SSMS",
          items: ["declare creates a variable; names start with @", "set or select @v = … assigns", "go ends a batch: an SSMS command, not T-SQL"] },
        { k: "code", h: "Control flow: if and while", src: tref("§5.2.2"), codeW: 7.4, code:
"declare @n int = 0,\n        @total numeric(12,2);\nselect @total = sum(budget)\nfrom   department;\nif @total > 400000\n    print 'Large total budget';\nelse\n    print 'Small total budget';\nwhile @n < 3\nbegin\n    set @n = @n + 1;\n    print @n;\nend",
          items: ["Output: Large total budget, 1, 2, 3", "begin … end groups statements", "Variables live only inside their batch"] },
        { k: "table", h: "T-SQL building blocks", src: tref("§5.2"), size: 22, rowH: 0.7, colW: [4.4, 7.73], rows: [
          ["Construct", "Use"], ["declare @v type = value", "Create a variable"], ["set @v = … / select @v = …", "Assign a value or a query result"],
          ["begin … end", "Group statements"], ["if … else", "Choose between statements"], ["while … begin … end", "Repeat statements"]] },
        { k: "code", h: "A scalar function", src: ex("§5.2.1"), codeW: 7.6, code:
"create function dbo.dept_count\n  (@dept_name varchar(20))\nreturns int\nas\nbegin\n  declare @d_count int;\n  select @d_count = count(*)\n  from   instructor\n  where  dept_name = @dept_name;\n  return @d_count;\nend;",
          items: ["Returns one value", "DSC §5.2 example, written in T-SQL", "A function may not modify the database"] },
        { k: "code", h: "Using a scalar function", src: ex("§5.2.1"), codeW: 7.6, code:
"select dept_name, budget\nfrom   department\nwhere  dbo.dept_count(dept_name) > 2;\n\n-- Comp. Sci., 120000",
          items: ["Usable wherever an expression is allowed", "Call it with its schema name: dbo.", "It runs once per row: slow on large tables (Lab 3)"] },
        { k: "code", h: "A table-valued function", src: ex("§5.2.1"), codeW: 7.6, code:
"create function dbo.instructor_of\n  (@dept_name varchar(20))\nreturns table\nas\nreturn (\n  select ID, name, dept_name, salary\n  from   instructor\n  where  dept_name = @dept_name);\ngo\nselect *\nfrom   dbo.instructor_of('Economics');\n-- Keynes, Smith",
          items: ["Returns a relation: used in from", "Behaves like a view with parameters"] },
        { k: "table", h: "Scalar or table-valued?", src: tref("§5.2.1"), size: 22, rowH: 0.85, colW: [3.0, 4.6, 4.53], rows: [
          ["", "Scalar function", "Inline table-valued function"],
          ["Returns", "One value", "A relation"], ["Used in", "select, where, …", "from"],
          ["Optimization", "Called row by row", "Merged into the calling query"]],
          note: "Prefer an inline table-valued function when a query must be reused with parameters." },
        { k: "quick", h: "Quick check: session 20", src: "Questions written for IDB201 on DSC 7th ed., §5.2 and the T-SQL reference",
          qs: ["Why does a variable declared before go no longer exist after it?",
               "Can dbo.dept_count be called in a from clause? Why or why not?",
               "What does dbo.instructor_of('Philosophy') return on University?"],
          ans: "1 go ends the batch, and variables live in one batch; 2 no, a scalar function returns a value, not a relation; 3 an empty relation." },
      ] },
    { n: 21, name: "Procedures and errors", sum: "Stored procedures; try…catch; a transaction inside a procedure",
      slides: [
        { k: "code", h: "A stored procedure", src: ex("§5.2.1"), codeW: 7.6, code:
"create procedure dbo.dept_count_proc\n  @dept_name varchar(20),\n  @d_count   int output\nas\nbegin\n  select @d_count = count(*)\n  from   instructor\n  where  dept_name = @dept_name;\nend;",
          items: ["Input and output parameters", "DSC uses in / out and call (SQL/PSM)"] },
        { k: "code", h: "Calling a procedure", src: ex("§5.2.1"), codeW: 7.6, code:
"declare @c int;\nexec dbo.dept_count_proc\n     'Physics', @c output;\nprint @c;     -- 2",
          items: ["A procedure is called with exec, not inside a query", "output is needed both in the definition and in the call", "Procedures may modify data and run transactions"] },
        { k: "table", h: "Functions or procedures?", src: tref("§5.2"), size: 22, rowH: 0.8, colW: [3.2, 4.4, 4.53], rows: [
          ["", "Function", "Procedure"],
          ["Called", "Inside a query", "With exec"], ["Modifies data", "No", "Yes"],
          ["Transactions", "No", "Yes"], ["Returns", "A value or a relation", "Output parameters, result sets"]] },
        { k: "code", h: "try…catch", src: "SQL Server T-SQL reference (TRY…CATCH, ERROR_MESSAGE)", codeW: 7.6, code:
"begin try\n  select 1 / 0;\n  print 'not reached';\nend try\nbegin catch\n  print error_message();\n  -- Divide by zero error\n  -- encountered.\nend catch;",
          items: ["An error inside try jumps to catch", "error_number(), error_message() describe it", "throw re-raises it to the caller"] },
        { k: "code", h: "A transaction inside a procedure", src: tref("§5.2; transactions of §4.3"), codeW: 12.13, code:
"create procedure dbo.transfer_budget\n  @from varchar(20), @to varchar(20),\n  @amount numeric(12,2)\nas begin\n begin try\n  begin transaction;\n   update department set budget = budget - @amount where dept_name = @from;\n   update department set budget = budget + @amount where dept_name = @to;\n  commit transaction;\n end try\n begin catch\n  if @@trancount > 0 rollback transaction;\n  throw;\n end catch\nend;",
        },
        { k: "cards", h: "The pattern step by step", src: tref("§4.3, §5.2"), cards: [
          ["begin transaction", "Start one unit of work"],
          ["try", "Run the statements; commit at the end"],
          ["catch", "If a transaction is open (@@trancount > 0), roll it back"],
          ["throw", "Tell the caller that the operation failed", HEX.paleOrange]] },
        { k: "draw", h: "What happens when the second update fails", src: "Diagram drawn for IDB201 after the T-SQL reference (TRY…CATCH) and DSC 7th ed., §4.3", draw: (s) => {
          L.node(s, "begin transaction", 0.7, 1.6, 3.0, 0.85, { size: 20 });
          L.node(s, "update 1: OK", 0.7, 2.95, 3.0, 0.85, { size: 20, fill: "E3F1E8", lineColor: HEX.green, color: HEX.green });
          L.node(s, "update 2: error", 0.7, 4.3, 3.0, 0.85, { size: 20, fill: "FBE9E7", lineColor: HEX.red, color: HEX.red });
          L.arrow(s, 2.2, 2.45, 2.2, 2.95); L.arrow(s, 2.2, 3.8, 2.2, 4.3);
          L.node(s, "catch: rollback", 5.0, 4.3, 3.2, 0.85, { size: 20, fill: HEX.paleOrange });
          L.node(s, "throw to caller", 9.4, 4.3, 3.2, 0.85, { size: 20 });
          L.arrow(s, 3.7, 4.72, 5.0, 4.72, { color: HEX.red }); L.arrow(s, 8.2, 4.72, 9.4, 4.72);
          L.autoCard(s, 5.0, 1.6, 7.6, 2.3, "Result", "Update 1 is undone: the budgets are as before, and the caller sees the error.", "flow", { fill: HEX.pale });
          L.text(s, "Without try…catch, SQL Server keeps update 1 and continues the batch.", 0.7, 5.6, 11.9, 0.8, { fontSize: 20, color: HEX.grey });
        } },
        { k: "cards", h: "Self-study: dynamic SQL with sp_executesql", src: "Self-study source: SQL Server T-SQL reference (sp_executesql); DSC 7th ed., §5.1 (session 18)", cards: [
          ["Dynamic SQL", "SQL text built at run time, e.g. a table name chosen by the user"],
          ["Safe form", "sp_executesql with parameters for every value"],
          ["Unsafe form", "exec('…' + @value + '…'): SQL injection (session 18, Lab 2)", HEX.paleOrange]] },
        { k: "quick", h: "Quick check: session 21", src: "Questions written for IDB201 on the T-SQL reference and DSC 7th ed., §5.2",
          qs: ["Why can a function not contain begin transaction, while a procedure can?",
               "In transfer_budget, why test @@trancount before rollback?",
               "What does the caller see if catch contains rollback but no throw?"],
          ans: "1 functions may not change the database state; 2 the error may occur before the transaction was opened; 3 no error: the failure is silently hidden." },
      ] },
    { n: 22, name: "Triggers", sum: "After and instead of triggers; inserted and deleted; when not to use triggers",
      slides: [
        { k: "cards", h: "5.3 Triggers: event, condition, action", src: tref("§5.3"), cards: [
          ["Event", "insert, delete or update on a relation"],
          ["Condition", "When the trigger should act"],
          ["Action", "The statements it runs, automatically"]],
          note: "Uses: rules that keys and checks cannot express; derived data; audit logs." },
        { k: "table", h: "Triggers in DSC and in SQL Server", src: tref("§5.3.1"), size: 22, rowH: 0.8, colW: [3.2, 4.4, 4.53], rows: [
          ["", "Standard SQL (DSC)", "SQL Server"],
          ["Timing", "before, after", "after, instead of"],
          ["Granularity", "for each row or statement", "once per statement"],
          ["Changed rows", "referencing new row / old row", "tables inserted and deleted"]] },
        { k: "table", h: "The inserted and deleted tables", src: tref("§5.3"), size: 22, rowH: 0.85, colW: [3.0, 4.6, 4.53], rows: [
          ["Statement", "inserted", "deleted"],
          ["insert", "the new rows", "empty"], ["delete", "empty", "the old rows"], ["update", "the new versions", "the old versions"]],
          note: "Both are relations: a trigger must work for any number of rows, including zero." },
        { k: "draw", h: "How an after trigger runs", src: "Diagram drawn for IDB201 after DSC 7th ed., §5.3 and the T-SQL reference", draw: (s) => {
          L.node(s, "update takes\nset grade = 'A' …", 0.7, 1.7, 3.2, 1.2, { mono: true, size: 18 });
          L.node(s, "rows changed\nin takes", 4.6, 1.7, 3.0, 1.2, { size: 20 });
          L.node(s, "trigger fires\nonce", 8.3, 1.7, 3.0, 1.2, { size: 20, fill: HEX.paleOrange });
          L.arrow(s, 3.9, 2.3, 4.6, 2.3); L.arrow(s, 7.6, 2.3, 8.3, 2.3);
          L.node(s, "inserted: new versions", 4.6, 3.6, 3.0, 0.8, { size: 18, fill: HEX.pale });
          L.node(s, "deleted: old versions", 4.6, 4.6, 3.0, 0.8, { size: 18, fill: HEX.pale });
          L.node(s, "one set-based update\nof student.tot_cred", 8.3, 3.8, 3.4, 1.3, { size: 20 });
          L.arrow(s, 9.8, 2.9, 9.8, 3.8); L.arrow(s, 7.6, 4.0, 8.3, 4.3); L.arrow(s, 7.6, 5.0, 8.3, 4.7);
          L.text(s, "If the trigger raises an error or rolls back, the triggering statement is undone with it.", 0.7, 5.75, 11.9, 0.7, { fontSize: 20, color: HEX.navy, bold: true });
        } },
        { k: "code", h: "An after trigger: maintaining tot_cred", src: ex("§5.3"), codeW: 12.13, code:
"-- adds credits when a grade changes from F or null to a pass\ncreate trigger dbo.credits_earned on takes\nafter update as begin\n update s\n set    tot_cred = s.tot_cred + c.credits\n from   student s\n join   inserted i on s.ID = i.ID\n join   deleted  d on d.ID = i.ID\n   and d.course_id = i.course_id and d.sec_id = i.sec_id\n   and d.semester = i.semester and d.year = i.year\n join   course c on c.course_id = i.course_id\n where  i.grade <> 'F' and i.grade is not null\n   and  (d.grade = 'F' or d.grade is null);\nend;",
        },
        { k: "cards", h: "Why the trigger is set-based", src: tref("§5.3"), cards: [
          ["The trap", "select @id = ID from inserted keeps only one row"],
          ["What goes wrong", "An update of 30 grades would update 1 student, not 30"],
          ["The fix", "Join with inserted and deleted, as in credits_earned", HEX.paleOrange]] },
        { k: "code", h: "An instead of trigger on a view", src: tref("§5.3; views of §4.2"), codeW: 8.0, code:
"create view dbo.faculty as\n  select ID, name, dept_name\n  from   instructor;\ngo\ncreate trigger dbo.faculty_insert\non dbo.faculty instead of insert\nas\nbegin\n  insert into instructor\n    (ID, name, dept_name, salary)\n  select ID, name, dept_name, null\n  from   inserted;\nend;",
          items: ["Replaces the statement with its own action", "Lets a view accept inserts the system cannot translate"] },
        { k: "code", h: "A business rule as a trigger", src: "Example written for IDB201; DSC 7th ed., §5.3; T-SQL reference (THROW)", codeW: 8.0, code:
"create trigger dbo.no_salary_cut\non instructor after update\nas\nbegin\n  if exists (select *\n             from inserted i\n             join deleted d on i.ID = d.ID\n             where i.salary < d.salary)\n  begin\n    rollback transaction;\n    throw 50001,\n      'Salaries may not decrease', 1;\n  end\nend;",
          items: ["A check constraint sees one row, not old and new values", "The whole update is rejected"] },
        { k: "cards", h: "When not to use triggers", src: tref("§5.3.3"), cards: [
          ["Hidden logic", "The effect of a statement is no longer visible in the statement"],
          ["Cascades", "One trigger fires another, possibly in a loop"],
          ["Bulk loads", "Loading data or restoring a backup may fire triggers by accident"],
          ["Prefer", "Constraints, cascading foreign keys, indexed views, explicit procedures", HEX.paleOrange]] },
      ] },
    { n: 23, name: "Cursors", sum: "T-SQL cursors; row-by-row versus set-based processing",
      slides: [
        { k: "cards", h: "From the cursor concept to T-SQL cursors", src: tref("§5.1, §5.2"), cards: [
          ["§5.1", "A host program reads a query result one row at a time"],
          ["§5.2", "SQL/PSM loops over the rows of a query"],
          ["T-SQL", "declare … cursor, open, fetch, close, deallocate"]] },
        { k: "code", h: "A T-SQL cursor", src: ex("§5.2"), codeW: 8.0, code:
"declare @id varchar(5), @sal numeric(8,2);\ndeclare c cursor for\n  select ID, salary from instructor\n  where  dept_name = 'Physics';\nopen c;\nfetch next from c into @id, @sal;\nwhile @@fetch_status = 0\nbegin\n  update instructor\n     set salary = @sal * 1.05\n   where ID = @id;\n  fetch next from c into @id, @sal;\nend;\nclose c;\ndeallocate c;",
          items: ["Updates Curie and Bohr, one at a time", "@@fetch_status = 0 while a row was fetched"] },
        { k: "draw", h: "The life cycle of a cursor", src: "Diagram drawn for IDB201 after the T-SQL reference (DECLARE CURSOR, FETCH)", draw: (s) => {
          ["declare", "open", "fetch next", "close", "deallocate"].forEach((t, i) => {
            const x = 0.6 + i * 2.5;
            L.node(s, t, x, 2.0, 2.1, 0.9, { mono: true, fill: i === 2 ? HEX.paleOrange : HEX.white });
            if (i < 4) L.arrow(s, x + 2.1, 2.45, x + 2.5, 2.45);
          });
          L.text(s, "repeat while @@fetch_status = 0", 3.6, 3.0, 5.2, 0.45, { fontSize: 18, color: HEX.orange, fontFace: L.CODE, align: "center" });
          L.autoCard(s, X0, 3.7, CW, 2.8, null, ["declare: name the query", "open: run it", "fetch next: copy one row into variables; repeat while a row was fetched", "close and deallocate: free the resources"], "cursor", { fill: HEX.pale });
        } },
        { k: "cards", h: "Row by row or set-based?", src: tref("§5.2"), cards: [
          ["Cursor (row by row)", ["One statement per row, plus fetch overhead", "The optimizer sees single-row updates"]],
          ["Set-based SQL", ["One declarative statement for all rows", "The optimizer plans for the whole set", "Usually much faster and shorter"], "E3F1E8"]] },
        { k: "code", h: "The cursor as one statement", src: ex("§3.9.3"), codeW: 8.0, code:
"update instructor\nset    salary = salary * 1.05\nwhere  dept_name = 'Physics';",
          items: ["Same effect as the cursor: Curie and Bohr get 5% more", "One statement, one plan, one log of changes"] },
        { k: "cards", h: "When a cursor is justified", src: tref("§5.2"), cards: [
          ["Per-row procedure", "Each row needs a call to a procedure or an external action"],
          ["Order-dependent logic", "The result for one row depends on the rows processed before it"],
          ["Otherwise", "Write one set-based statement: the default choice", HEX.paleOrange]] },
        { k: "cards", h: "Lab 3 part 2 (session 25): Investigate", src: "IDB201 Lab 3 handout; lab3_scale.sql", cards: [
          ["Hypothesis", "A cursor slows down faster than a set-based update as the table grows"],
          ["Method", "Run both on 1,000, 10,000 and 100,000 rows (lab3_scale.sql) and time them"],
          ["Evidence", "Plot time against rows; explain the result with this session"]] },
        { k: "cards", h: "Progress test 1: session 26", src: "IDB201 syllabus, Grading structure (Progress test 1)", cards: [
          ["Scope", "Chapters 1–5 and their self-study: bag semantics, §4.7, §5.5"],
          ["Format", "20 multiple-choice questions, 30 minutes, 5% of the grade"],
          ["Prepare", "Quick checks, practice exercises and Labs 1–3", HEX.paleOrange]] },
        { k: "quick", h: "Quick check: session 23", src: "Questions written for IDB201 on the T-SQL reference and DSC 7th ed., §5.2",
          qs: ["What is the value of @@fetch_status after the last row has been fetched once more?",
               "Rewrite: a cursor that sets tot_cred = 0 for every student of Biology.",
               "Give one task for which a cursor is the right tool."],
          ans: "1 a value other than 0 (−1): the loop ends; 2 update student set tot_cred = 0 where dept_name = 'Biology'; 3 e.g. calling a procedure that sends one e-mail per row." },
      ] },
  ],
  back: [
    { k: "list", h: "Practice exercises", src: "Exercises written for IDB201; more: Labs 2–3 and DSC Practice Exercises 5.6–5.9, p. 236", items: [
      "Write dbo.course_count(@id) returning the number of takes rows of a student; list the students with more than 3.",
      "A procedure runs exec('select * from instructor where name = ''' + @name + ''''). Which @name returns all rows? Fix it.",
      "Why must a trigger on takes join with inserted instead of reading one row into a variable?"] },
    { k: "list", h: "Practice exercises: answers", src: "Answers checked on the University data (givenDB); T-SQL reference", fill: HEX.pale, items: [
      "return (select count(*) from takes where ID = @id); result: An 6, Giang 4, Quang 6, Viet 4. A join with group by … having is usually faster.",
      "@name = x' or '1'='1 makes the condition always true. Fix: sp_executesql with a parameter, or static SQL with the variable.",
      "A trigger fires once per statement; an update of 30 rows puts 30 rows in inserted, and a variable would keep only one."] },
    { k: "cards", h: "Summary", src: "DSC 7th ed., §5.1–5.3; SQL Server T-SQL reference", cols: 3, num: false, cards: [
      ["T-SQL", "Variables, if, while, batches"],
      ["Functions", "Scalar or table-valued; no data changes"],
      ["Procedures", "Parameters, exec, transactions"],
      ["Errors", "try…catch, rollback, throw"],
      ["Triggers", "inserted, deleted; set-based; use sparingly"],
      ["Cursors", "Only when per-row logic is needed", HEX.paleOrange]] },
    { k: "cards", h: "Before the next session", src: "IDB201 syllabus, sessions 24–27", cards: [
      ["Sessions 24–25", "Lab 3: functions, procedures, triggers, cursor versus set-based"],
      ["Session 26", "Progress test 1: Chapters 1–5", HEX.paleOrange],
      ["Session 27", "Read DSC Ch. 6, §6.1–6.3, pp. 241–251"]] },
  ],
};
