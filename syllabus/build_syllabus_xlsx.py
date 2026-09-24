"""Build the IDB201 syllabus workbook from the university template.

Usage (from the repository root):
    pip install openpyxl
    python syllabus/build_syllabus_xlsx.py

Input : syllabus/template/Syllabus_Temp.xlsx   (the official template, unchanged)
Output: syllabus/IDB201_Syllabus.xlsx

All syllabus content lives in the data structures below, so to revise the syllabus
you edit this file and run it again.
"""
from copy import copy
from pathlib import Path

import openpyxl
from openpyxl.styles import Alignment

ROOT = Path(__file__).resolve().parent
TEMPLATE = ROOT / "template" / "Syllabus_Temp.xlsx"
OUTPUT = ROOT / "IDB201_Syllabus.xlsx"

# ---------------------------------------------------------------------------
# 1. General information (sheet "Syllabus", column C)
# ---------------------------------------------------------------------------
GENERAL = {
    "Document type": "SYLLABUS",
    "Program": "UNDERGRADUATE PROGRAM – Bachelor of Computer Science, specialization in Artificial Intelligence "
               "and Data Science (BCS_AD), cohort K22A onward – Talented-student (honors) classes",
    "Decision No.": "",
    "Course Name": "Introduction to Databases_Giới thiệu về cơ sở dữ liệu",
    "Course Code": "IDB201",
    "Leaning-Teaching Method": "Offline",
    "No of credits": "3",
    "Degree Level": "Bachelor",
    "Time Allocation": "45h (60 sessions) contact hours + 1h final exam + 104h self-study",
    "Pre-requisite": "None (semester 1). Taken together with MAD102 Discrete Mathematics and "
                     "PFP191 Programming Fundamentals with Python.",
    "Description": (
        "This course gives a rigorous, research-oriented introduction to database systems for talented first-year "
        "Computer Science students. Students model data with the Entity-Relationship model and map it to the "
        "relational model, which is studied as a mathematical structure. They express queries in relational algebra, "
        "relational calculus and SQL, and reason about the semantics and expressive power of these languages. "
        "Functional dependency theory is developed with proofs and algorithms and applied to normalization. The "
        "course then opens the DBMS: storage and indexing under an I/O cost model, query processing and "
        "optimization, and the theory of transactions, concurrency control and recovery. Every chapter includes a "
        "'Research Corner' built around a seminal paper, and students implement core algorithms in Python and carry "
        "out reproducible experiments. At the end of the course, students can design normalized schemas, query "
        "databases proficiently in SQL, explain the internal mechanisms of storage and transaction control, and "
        "conduct and report a small research study in the database field."
    ),
    "Student's tasks": (
        "- Students must attend at least 80% of contact slots in order to be accepted to the final examination.\n"
        "- Read the assigned textbook sections and the Research Corner paper BEFORE each theory session, and "
        "prepare answers to the constructivist questions.\n"
        "- Complete all 8 research labs, including the 'Investigate' part and the Python implementation tasks, "
        "and submit them on time.\n"
        "- Complete Assignment 1 (individual technical report) and Assignment 2 (group mini research project: "
        "short paper, reproducible code and presentation).\n"
        "- Keep all code, scripts and measurements in a version-controlled repository so that results are "
        "reproducible.\n"
        "- Disclose any use of generative AI tools in submitted work; undisclosed use is treated as a breach of "
        "academic integrity.\n"
        "- Use laptop in class only for learning purpose.\n"
        "- Promptly access to the FU FLM at https://flm.fpt.edu.vn/ for up-to-date course information."
    ),
    "Tools": (
        "- Microsoft SQL Server 2022 (Developer/Express) or SQL Server in Docker\n"
        "- SQL Server Management Studio (SSMS) or Azure Data Studio\n"
        "- Python 3 with pyodbc, pandas and pytest; Visual Studio Code or PyCharm\n"
        "- RelaX relational algebra calculator (online)\n"
        "- draw.io (diagrams.net) for ER diagrams\n"
        "- Git / GitHub for reproducible code and experiments\n"
        "- LaTeX (Overleaf) with the IEEE conference template for Assignment 2"
    ),
    "Note": (
        "1) On-going Assessment\n"
        "- 8 Research labs:                        10%\n"
        "- 2 Progress tests:                        20%\n"
        "- Assignment 1 (technical report):   10%\n"
        "- Assignment 2 (research project):  20%\n"
        "- 1 Practical Exam (PE):                 10%\n"
        "2) 1 Final Exam:                            30%\n"
        "3) Final Result                             100%\n"
        "Completion Criteria:\n"
        "1) Every on-going assessment component > 0\n"
        "2) Practical Exam > 0\n"
        "3) Final Exam Score >= 4 & Final Result >= 5\n"
        "Rationale: the course serves talented students on an academic track, so 40% of the grade rewards "
        "research work (labs, report, research project), 60% rewards individual mastery of theory and skills "
        "(progress tests, practical exam, final exam), and the final exam includes at least 30% "
        "analysis-level items."
    ),
    "Min GPA to pass": "5",
    "Scoring scale": "10",
    "Approved date": "",
}

# ---------------------------------------------------------------------------
# 2. Materials
# ---------------------------------------------------------------------------
# (description, purpose, ISBN, type, note, author, publisher, published date, edition)
MATERIALS = [
    ("Database System Concepts", "textbook", "978-0-07-802215-9", "hardcopy",
     "[DSC] Main textbook", "Abraham Silberschatz, Henry F. Korth, S. Sudarshan", "McGraw-Hill Education", "2020", "7th"),
    ("Database Management Systems", "textbook", "978-0-07-246563-1", "hardcopy",
     "[DMS] Main textbook", "Raghu Ramakrishnan, Johannes Gehrke", "McGraw-Hill", "2003", "3rd"),
    ("A Relational Model of Data for Large Shared Data Banks", "reference", "", "online",
     "Research Corner Ch. 3. Communications of the ACM 13(6):377–387", "E. F. Codd", "ACM", "1970", ""),
    ("The Entity-Relationship Model—Toward a Unified View of Data", "reference", "", "online",
     "Research Corner Ch. 2. ACM TODS 1(1):9–36", "Peter P. Chen", "ACM", "1976", ""),
    ("Relational Completeness of Data Base Sublanguages", "reference", "", "online",
     "Research Corner Ch. 4. In R. Rustin (ed.), Data Base Systems, pp. 65–98", "E. F. Codd", "Prentice-Hall", "1972", ""),
    ("A Simple Guide to Five Normal Forms in Relational Database Theory", "reference", "", "online",
     "Research Corner Ch. 8. Communications of the ACM 26(2):120–125", "William Kent", "ACM", "1983", ""),
    ("Access Path Selection in a Relational Database Management System", "reference", "", "online",
     "Research Corner Ch. 9. Proc. ACM SIGMOD", "P. G. Selinger et al.", "ACM", "1979", ""),
    ("The Case for Learned Index Structures", "reference", "", "online",
     "Research Corner Ch. 9. Proc. ACM SIGMOD", "T. Kraska, A. Beutel, E. H. Chi, J. Dean, N. Polyzotis", "ACM", "2018", ""),
    ("A Critique of ANSI SQL Isolation Levels", "reference", "", "online",
     "Research Corner Ch. 10. Proc. ACM SIGMOD", "H. Berenson et al.", "ACM", "1995", ""),
    ("What Goes Around Comes Around… And Around…", "reference", "", "online",
     "Research Corner Ch. 1. ACM SIGMOD Record 53(2)", "Michael Stonebraker, Andrew Pavlo", "ACM", "2024", ""),
    ("Transact-SQL reference", "reference", "", "online",
     "https://learn.microsoft.com/sql/t-sql/", "Microsoft", "Microsoft", "", ""),
]

# ---------------------------------------------------------------------------
# 3. CLOs
# ---------------------------------------------------------------------------
CLOS = [
    ("CLO1", "Explain the fundamental concepts of database systems (data models, schemas, the three-schema "
             "architecture, data independence) and trace how they arose from the research literature."),
    ("CLO2", "Design Entity-Relationship models from requirements, compare design alternatives, and identify "
             "constraints that the ER model cannot express."),
    ("CLO3", "Map ER models to relational schemas and state keys, foreign keys and other integrity constraints "
             "precisely, including as logical statements."),
    ("CLO4", "Express queries in relational algebra and relational calculus, prove simple equivalences, and "
             "reason about the expressive power of query languages."),
    ("CLO5", "Write SQL to define, modify and query databases (joins, aggregation, subqueries, views, access "
             "from Python) and explain its semantics (bags, three-valued logic) by translation to algebra."),
    ("CLO6", "Apply functional dependency theory: compute closures, keys and minimal covers, prove properties, "
             "normalize to 3NF/BCNF, verify lossless-join and dependency preservation, and implement these "
             "algorithms in Python."),
    ("CLO7", "Analyze storage, indexing, query processing and optimization with I/O cost models, and evaluate "
             "index and plan choices experimentally."),
    ("CLO8", "Analyze schedules for conflict serializability and recoverability, explain locking, isolation "
             "levels and logging-based recovery, and justify the correctness of two-phase locking."),
    ("CLO9", "Conduct a small research study in databases: read primary literature, formulate a question or "
             "hypothesis, design a reproducible experiment or implementation, and report the results in an "
             "academic format."),
]

# ---------------------------------------------------------------------------
# 4. Schedule: (topic, CLO, ITU, student's materials, lecturer's materials, student's task, lecturer's task)
#    ITU: I = Introduce, T = Teach, U = Utilize
# ---------------------------------------------------------------------------
def S(topic, clo, itu, smat, lmat, stask, ltask):
    return (topic, clo, itu, smat, lmat, stask, ltask)


def theory(topic, clo, itu, ch, reading):
    return S(topic, clo, itu,
             f"- Lecture notes & slides: Chapter {ch}\n- Textbook: {reading}",
             f"- Syllabus IDB201\n- Slides: Chapter {ch}\n- Textbooks [DSC], [DMS]",
             f"Read Chapter {ch} ({reading}) before class; prepare the constructivist questions",
             f"Teach Chapter {ch}; lead the discussion of the constructivist questions")


def lab(topic, clo, n, extra=""):
    return S(topic, clo, "U",
             f"- Lab {n} handout{extra}",
             f"- Lab {n} handout and sample solution",
             f"Do Lab {n}; submit before the end of the session",
             f"Guide Lab {n}; review and grade submissions")


SCHEDULE = [
    # Chapter 1
    theory("Course introduction (syllabus, assessment, research orientation)\n1.1 Basic definitions\n1.2 The file-based approach and its problems",
           "CLO1", "I", 1, "[DSC] Ch. 1; [DMS] Ch. 1"),
    theory("1.3 Characteristics of the database approach\n1.4 Data models; schema vs. instance\n1.5 Three-schema architecture; data independence\n1.6 Database languages",
           "CLO1", "T", 1, "[DSC] Ch. 1; [DMS] Ch. 1"),
    S("1.7–1.10 Users, DBMS components, architectures\nResearch Corner: Stonebraker & Pavlo (2024)\nLab 1: Install SQL Server, load UniversityDB",
      "CLO1", "T\nU", "- Slides: Chapter 1\n- Paper: Stonebraker & Pavlo (2024)\n- Lab 1 handout", "- Slides: Chapter 1\n- Lab 1 handout",
      "Read the paper with the guiding questions; do Lab 1", "Lead the paper discussion; guide Lab 1"),
    # Chapter 2
    theory("2.1 The database design process\n2.2 Entities and attributes (simple, composite, multivalued, derived, key)", "CLO2", "T", 2, "[DSC] 6.1–6.3; [DMS] 2.1–2.3"),
    theory("2.3 Relationships: degree, cardinality ratio, participation, (min, max) notation, relationship attributes, recursive relationships", "CLO2", "T", 2, "[DSC] 6.2–6.4; [DMS] 2.4–2.5"),
    theory("2.4 Weak entity types\n2.5 Design guidelines and choices (binary vs. ternary)", "CLO2", "T", 2, "[DSC] 6.5–6.6, 6.8; [DMS] 2.4–2.5"),
    theory("2.6 Worked example: UniversityDB\n2.7 Crow's-foot notation\n2.8 Limits of the ER model\nResearch Corner: Chen (1976)", "CLO2", "T\nU", 2, "[DSC] 6.1–6.8; [DMS] Ch. 2; Chen (1976)"),
    lab("Lab 2 (part A): ER design – bookstore, hospital, design critique", "CLO2", 2),
    # Chapter 3
    theory("3.1 Relational model concepts\n3.2 Keys: superkey, candidate key, primary key, foreign key", "CLO3", "T", 3, "[DSC] 2.1–2.3; [DMS] 3.1"),
    theory("3.3 Integrity constraints and their violations\n3.6 The relational model as mathematics (relations as sets, constraints as logic)", "CLO3", "T", 3, "[DSC] 2.3–2.4; [DMS] 3.2–3.3"),
    theory("3.4 ER-to-relational mapping, steps 1–4 (strong and weak entities, 1:1, 1:N)", "CLO3", "T", 3, "[DSC] 6.7; [DMS] 3.5"),
    theory("3.4 Mapping steps 5–7 (M:N, multivalued, n-ary); 3.5 Worked example\nResearch Corner: Codd (1970)", "CLO3", "T", 3, "[DSC] 6.7; [DMS] 3.5; Codd (1970)"),
    S("Lab 2 (part B): ER-to-relational mapping; reverse engineering UniversityDB\nAssignment 1 released",
      "CLO2, CLO3", "U", "- Lab 2 handout\n- Assignment 1 brief", "- Lab 2 sample solution\n- Assignment 1 brief and rubric",
      "Do Lab 2 (part B); read the Assignment 1 brief", "Guide Lab 2; present Assignment 1"),
    # Chapter 4
    theory("4.1 Relational algebra overview\n4.2 Selection, projection, rename\n4.3 Set operations and Cartesian product", "CLO4", "T", 4, "[DSC] 2.5–2.6; [DMS] 4.1–4.2"),
    theory("4.4 Joins: theta, equi, natural, outer, semi-join", "CLO4", "T", 4, "[DSC] 2.6; [DMS] 4.2"),
    theory("4.5 Division\n4.6 Aggregation\n4.7 Complete set of operators\n4.8–4.9 Translation to SQL; worked examples", "CLO4", "T", 4, "[DSC] 2.6; [DMS] 4.2"),
    theory("4.10 Relational calculus (TRC, DRC), safety, Codd's theorem\n4.11 Limits of expressive power (transitive closure)\nResearch Corner: Codd (1972)", "CLO4", "T", 4, "[DMS] 4.3–4.4; Codd (1972)"),
    lab("Lab 3: Relational algebra and calculus; Python mini relational-algebra evaluator", "CLO4", 3, "\n- Python starter code labs/python (ra.py)"),
    S("Progress test 1 (Chapters 1–4)\nReview exercises", "CLO1, CLO2, CLO3, CLO4", "U",
      "- Slides: Chapters 1–4", "- Progress test 1", "Review Chapters 1–4; take Progress test 1", "Run and grade Progress test 1; review the answers"),
    # Chapter 5
    theory("5.1 SQL overview\n5.2 Databases and schemas\n5.3 SQL Server data types", "CLO5", "T", 5, "[DSC] 3.1–3.2; [DMS] 5.1"),
    theory("5.4 CREATE TABLE\n5.5 Constraints and referential actions; IDENTITY", "CLO5", "T", 5, "[DSC] 4.4–4.5; [DMS] 3.2–3.3"),
    theory("5.6–5.9 ALTER/DROP, creation order, catalog, DCL\n5.10 Assertions and the cost of integrity checking", "CLO5", "T", 5, "[DSC] 4.4–4.7; [DMS] 3.3, 5.7"),
    lab("Lab 4 (part 1): LibraryDB – tables and constraints", "CLO3, CLO5", 4),
    lab("Lab 4 (part 2): testing constraints, ALTER TABLE, reflection\nAssignment 1 consultation", "CLO3, CLO5", 4),
    # Chapter 6
    theory("6.1 The SELECT statement and logical processing order\n6.2 Single-table queries, predicates, built-in functions", "CLO5", "T", 6, "[DSC] 3.3–3.4; [DMS] 5.2"),
    theory("6.3 NULL and three-valued logic\n6.9 Semantics of SQL: translation to algebra, bag semantics", "CLO5", "T", 6, "[DSC] 3.6; [DMS] 5.6"),
    theory("6.4 Joins: inner, outer, self, anti-join", "CLO5", "T", 6, "[DSC] 4.1; [DMS] 5.6"),
    lab("Lab 5 (part A): single-table queries and joins", "CLO5", 5),
    theory("6.5 Aggregation: GROUP BY, HAVING", "CLO5", "T", 6, "[DSC] 3.7; [DMS] 5.5"),
    theory("6.6 Subqueries: scalar, IN/ANY/ALL, correlated, EXISTS, division in SQL", "CLO5", "T", 6, "[DSC] 3.8; [DMS] 5.4"),
    theory("6.6–6.8 CTEs, set operations, window functions\nResearch Corner: Chamberlin & Boyce (1974); Guagliardo & Libkin (2017)", "CLO5", "T", 6, "[DSC] 3.5, 3.8, 5.5; [DMS] 5.3"),
    lab("Lab 5 (part B): aggregation, subqueries, set operations", "CLO5", 5),
    lab("Lab 5 (part B, challenge): recursive CTE and expressive power", "CLO4, CLO5", 5),
    # Chapter 7
    theory("7.1–7.5 INSERT, UPDATE, DELETE, TRUNCATE, MERGE, OUTPUT", "CLO5", "T", 7, "[DSC] 3.9; [DMS] 3.6"),
    theory("7.6 Views: definition, updatability, WITH CHECK OPTION\n7.9 View expansion and the view-update problem", "CLO5", "T", 7, "[DSC] 4.2; [DMS] 3.6; Bancilhon & Spyratos (1981)"),
    theory("7.7 Using the database from Python (pyodbc, pandas); SQL injection", "CLO5", "T", 7, "[DSC] 5.1; [DMS] 6.1–6.2"),
    lab("Lab 6: data modification, views, and SQL from Python", "CLO5", 6),
    S("Assignment 1: submission and oral defense", "CLO2, CLO3, CLO4, CLO9", "U",
      "- Assignment 1 brief and rubric", "- Assignment 1 rubric", "Submit the report; defend it orally (5 minutes)", "Assess reports and oral defenses"),
    # Chapter 8
    theory("8.1 Anomalies\n8.2 Functional dependencies; Armstrong's axioms", "CLO6", "T", 8, "[DSC] 7.1–7.2; [DMS] 19.1–19.3"),
    theory("8.3 Attribute closure; finding candidate keys", "CLO6", "T", 8, "[DSC] 7.4; [DMS] 19.3"),
    theory("8.4 Minimal cover\n8.10 Proofs: soundness, correctness of the closure algorithm", "CLO6", "T", 8, "[DSC] 7.4; [DMS] 19.3"),
    theory("8.5 Normal forms: 1NF, 2NF, 3NF, BCNF", "CLO6", "T", 8, "[DSC] 7.3; [DMS] 19.4"),
    theory("8.6–8.8 Lossless join and dependency preservation; 3NF synthesis and BCNF decomposition; worked example", "CLO6", "T", 8, "[DSC] 7.5; [DMS] 19.5–19.6"),
    theory("8.11 Computational complexity of normalization\n8.12 MVDs and 4NF\nResearch Corner: Kent (1983); Armstrong (1974)", "CLO6", "T", 8, "[DSC] 7.6; [DMS] 19.8; Kent (1983)"),
    lab("Lab 7: FD theory on paper; Python FD toolkit (closure, keys, minimal cover, BCNF, chase)", "CLO6", 7, "\n- Python starter code labs/python (fd.py)"),
    S("Progress test 2 (Chapters 5–8)\nReview exercises", "CLO5, CLO6", "U",
      "- Slides: Chapters 5–8", "- Progress test 2", "Review Chapters 5–8; take Progress test 2", "Run and grade Progress test 2; review the answers"),
    # Chapter 9
    theory("9.1 Why storage matters\n9.2 Pages, records, file organizations, the buffer pool", "CLO7", "T", 9, "[DSC] 13.1–13.3; [DMS] 8.1–8.2, 9.1–9.4"),
    theory("9.3 Indexes: B+-trees, hash indexes, clustered vs. non-clustered, choosing indexes", "CLO7", "T", 9, "[DSC] 14.1–14.5; [DMS] 8.3–8.5, 10.1–10.3"),
    theory("9.4 Query processing; selection and join algorithms\n9.6 Cost formulas", "CLO7", "T", 9, "[DSC] 15.1–15.5; [DMS] 12.1–12.4, 14.4"),
    theory("9.5 Reading execution plans\n9.7 Query optimization and join ordering\nResearch Corner: Selinger et al. (1979); Leis et al. (2015); Kraska et al. (2018)", "CLO7", "T", 9, "[DSC] 16.1–16.4; [DMS] 12.1–12.4, 15.1–15.4"),
    lab("Lab 8 (part A): indexing experiments and execution plans\nAssignment 2 released (research topics)", "CLO7, CLO9", 8, "\n- Assignment 2 brief"),
    # Chapter 10
    theory("10.1 Transactions\n10.2 ACID properties\n10.3 Transactions in T-SQL\n10.4 Transaction states", "CLO8", "T", 10, "[DSC] 17.1–17.4; [DMS] 16.1–16.3"),
    theory("10.5 Concurrency anomalies\n10.6 Schedules and conflict serializability; precedence graphs", "CLO8", "T", 10, "[DSC] 17.5–17.6; [DMS] 16.3"),
    theory("10.7 Locking, two-phase locking, deadlocks\n10.8 Isolation levels\n10.9 Fixing a race condition", "CLO8", "T", 10, "[DSC] 18.1–18.2, 17.8; [DMS] 16.4–16.6, 17.1–17.2"),
    theory("10.10 Recovery (WAL, ARIES overview)\n10.11 Recoverability, view serializability, proof that 2PL is correct, snapshot isolation and write skew\nResearch Corner: Eswaran et al. (1976); Berenson et al. (1995)", "CLO8", "T", 10, "[DSC] 17.7, 18.8, 19.1–19.4; [DMS] 16.7, 18.1"),
    lab("Lab 8 (part B): concurrency experiments with two sessions; Python serializability tester", "CLO8", 8, "\n- Python starter code labs/python (schedule.py)"),
    S("Assignment 2: research progress meeting (question, method, preliminary results)", "CLO9", "U",
      "- Assignment 2 brief and rubric", "- Assignment 2 rubric", "Present progress; revise the method", "Give feedback on each group's method"),
    S("Assignment 2: paper presentations (part 1)", "CLO7, CLO8, CLO9", "U",
      "- Assignment 2 brief", "- Assignment 2 rubric", "Present the paper (10 minutes + 5 minutes Q&A)", "Assess presentations and papers"),
    S("Assignment 2: paper presentations (part 2)", "CLO7, CLO8, CLO9", "U",
      "- Assignment 2 brief", "- Assignment 2 rubric", "Present the paper; submit the final paper and code", "Assess presentations and papers"),
    S("Course review: key results and open research questions\nPractical exam preparation", "CLO1–CLO9", "U",
      "- Slides: all chapters\n- Question bank", "- Slides: all chapters\n- Question bank", "Review all chapters; practice SQL", "Review; answer questions"),
]
assert len(SCHEDULE) == 60, len(SCHEDULE)

# ---------------------------------------------------------------------------
# 5. Constructivist questions: (session, name, question)
# ---------------------------------------------------------------------------
CQ = [
    (3, "CQ1", "Codd separated the logical view of data from its physical storage. What would be lost if applications had to know how and where each record is stored?"),
    (3, "CQ2", "Why do new data models (XML, document, graph, vector) keep appearing, and why do many of them end up adding SQL-like features?"),
    (3, "CQ3", "When is a database system NOT the right tool? Give a concrete example and justify it."),
    (7, "CQ1", "Why is Grade an attribute of the enrollment relationship and not of STUDENT or SECTION? What goes wrong if it is placed on either entity?"),
    (7, "CQ2", "Is a ternary relationship always equivalent to three binary relationships? Construct a counterexample."),
    (7, "CQ3", "Give a business rule of UniversityDB that cannot be drawn in an ER diagram. How should a designer record and enforce it?"),
    (12, "CQ1", "What would break if relations were allowed to contain duplicate tuples? Consider keys, projection and the meaning of a fact."),
    (12, "CQ2", "Why is NULL allowed in a foreign key but not in a primary key? Argue from what each constraint means."),
    (12, "CQ3", "A 1:1 relationship can be mapped with a foreign key on either side, or by merging the two relations. How would you decide, and what evidence would you use?"),
    (17, "CQ1", "Why does projection remove duplicates in relational algebra while SELECT in SQL does not? What are the costs and benefits of each choice?"),
    (17, "CQ2", "Division expresses 'for all' queries. Why is there no basic 'for all' operator, and how does calculus express the same idea?"),
    (17, "CQ3", "Relational algebra cannot compute the transitive closure of a relation. Why does a fixed-size expression limit what a language can express?"),
    (22, "CQ1", "Why should integrity rules be declared in the database rather than checked in application code? When is the opposite true?"),
    (22, "CQ2", "Why do almost no DBMSs implement CREATE ASSERTION, although it is in the SQL standard?"),
    (22, "CQ3", "ON DELETE CASCADE is convenient. What risks does it create, and how could a cascade chain surprise a user?"),
    (26, "CQ1", "Under three-valued logic, 'p OR NOT p' is not always true. Which everyday query mistakes follow from this?"),
    (26, "CQ2", "Why does 'x NOT IN (subquery)' return no rows when the subquery contains NULL, while NOT EXISTS behaves differently?"),
    (26, "CQ3", "Which algebraic laws that hold for sets fail for bags? Why did SQL choose bag semantics anyway?"),
    (31, "CQ1", "A correlated subquery is evaluated 'once per outer row' in the textbook model. How could a DBMS evaluate it more efficiently?"),
    (31, "CQ2", "The same query can often be written with a join, a subquery or a set operation. Should the choice affect performance? Why or why not?"),
    (31, "CQ3", "Why did it take until 2017 to give SQL a complete formal semantics?"),
    (35, "CQ1", "Deleting a row through a join view can be translated in more than one way. Which translation should the DBMS choose, and why?"),
    (35, "CQ2", "A view costs nothing extra at run time. How is that possible?"),
    (35, "CQ3", "Why do parameterized queries prevent SQL injection, while escaping user input is considered fragile?"),
    (44, "CQ1", "Every normal form can be seen as removing one kind of redundancy. What single idea unifies them?"),
    (44, "CQ2", "BCNF decomposition may lose a dependency. When would you accept 3NF instead, and what do you gain?"),
    (44, "CQ3", "Testing whether an attribute is prime is NP-complete. What does this mean for automatic schema design tools?"),
    (50, "CQ1", "Why is a B-tree node the size of a disk page instead of holding a single key as in a binary search tree?"),
    (50, "CQ2", "The optimizer relies on estimates. What happens when the estimates are wrong, and where do the errors come from?"),
    (50, "CQ3", "Could a machine-learning model replace an index? What would you need to measure to decide?"),
    (55, "CQ1", "Why is serializability the accepted correctness criterion for concurrent transactions? What weaker criteria do real systems use, and why?"),
    (55, "CQ2", "Why does two-phase locking guarantee serializability? Explain the idea of the lock point."),
    (55, "CQ3", "Snapshot isolation prevents dirty reads, non-repeatable reads and phantoms. Why is it still not serializable?"),
]

# ---------------------------------------------------------------------------
# 6. Grading structure
# (component, type, weight, part, min, duration, CLO, question type, number, scope, how, note, reference)
# ---------------------------------------------------------------------------
GRADING = [
    ("Research labs", "on-going", 10, 8, 0.0001, "In lab sessions", "CLO2, CLO3, CLO4, CLO5, CLO6, CLO7, CLO8",
     "Lab exercises, Python implementations with tests, 'Investigate' mini-reports", 8,
     "Labs 1–8 (Chapters 1–10)", "in class, by instructor",
     "Each lab is worth 1.25%. The 'Investigate' part (hypothesis, experiment, evidence) counts for at least 40% of each lab mark. Python tasks are graded by the provided unit tests and by code review.",
     "Lab"),
    ("Progress test 1", "on-going", 10, 1, 0.0001, "30'", "CLO1, CLO2, CLO3, CLO4",
     "Multiple choices (marked by computer) + short written reasoning", "20 MCQ + 2 written",
     "- cover content 1, 2, 3, 4\n- written items: one ER design or mapping task, one relational algebra/calculus proof or query",
     "in class, by instructor",
     "Instruction and schedules for Progress tests must be presented in the Course Implementation Plan approved by director of the campus.\n\nProgress test must be taken right after the last lectures of required material.\n\nInstructor has responsibility to review the test for students after graded.",
     "Progress test"),
    ("Progress test 2", "on-going", 10, 1, 0.0001, "30'", "CLO5, CLO6",
     "Multiple choices (marked by computer) + short written reasoning", "20 MCQ + 2 written",
     "- cover content 5, 6, 7, 8\n- written items: one SQL semantics question (NULL/bags), one FD proof or normalization task",
     "in class, by instructor",
     "Instruction and schedules for Progress tests must be presented in the Course Implementation Plan approved by director of the campus.\n\nProgress test must be taken right after the last lectures of required material.\n\nInstructor has responsibility to review the test for students after graded.",
     "Progress test"),
    ("Assignment 1", "on-going", 10, 1, 0.0001, "Take-home, 3 weeks + 5' oral defense", "CLO2, CLO3, CLO4, CLO9",
     "Individual technical report (4–6 pages) + oral defense", 1,
     "- cover content 2, 3, 4, 5, 6\n- design and theory report: ER model with justified alternatives, formal relational schema, constraints as logic, algebra/calculus/SQL queries with correctness arguments, one guided experiment",
     "take-home, submitted in session 38, graded by instructor with rubric",
     "Instructor has responsibility to review the assignment for students after graded. Plagiarism or undisclosed AI-generated content leads to a score of 0.",
     "Assignment"),
    ("Assignment 2", "on-going", 20, 1, 0.0001, "Take-home, 4 weeks + 15' presentation", "CLO6, CLO7, CLO8, CLO9",
     "Group mini research project (2–3 students): short paper (IEEE format, 4–6 pages), reproducible code, presentation", 1,
     "- cover content 6–10 and the Research Corner papers\n- topics: empirical studies (indexes, join algorithms, isolation levels), algorithm implementation and evaluation (FD algorithms, serializability, relational algebra), or reproducing a result from a paper",
     "take-home; progress meeting in session 57; presentations in sessions 58–59; graded by instructor with rubric",
     "Paper 50% (question, method, results, discussion, related work), reproducibility of code and data 20%, presentation and Q&A 20%, peer evaluation 10%. Individual marks may differ within a group based on contribution logs.",
     "Assignment"),
    ("Practical exam", "on-going", 10, 1, 0.0001, "60'", "CLO5",
     "Practical questions on computer", 2,
     "- cover content 5, 6, 7\n- create a schema with constraints from a specification; write SQL queries (joins, aggregation, subqueries, views)",
     "by exam board, using computer",
     "The exam questions must be updated or different at least 70% to the previous ones.",
     "on-going"),
    ("Final exam", "final exam", 30, 1, 4, "60'", "CLO1, CLO2, CLO3, CLO4, CLO5, CLO6, CLO7, CLO8",
     "Multiple choices\nMarked by Computer", 50,
     "concepts, proofs, algorithms and analysis; all studied chapters; at least 30% of items at the Analyze level or above",
     "by exam board, using computer",
     "The exam questions must be updated or different at least 70% to the previous ones.",
     "Final exam"),
]
assert sum(g[2] for g in GRADING) == 100


# ---------------------------------------------------------------------------
# Writing helpers
# ---------------------------------------------------------------------------
def copy_style(src, dst):
    if src.has_style:
        dst.font = copy(src.font)
        dst.border = copy(src.border)
        dst.fill = copy(src.fill)
        dst.number_format = src.number_format
        dst.protection = copy(src.protection)
        dst.alignment = copy(src.alignment)


def put(ws, row, col, value, style_from=None, wrap=True):
    cell = ws.cell(row=row, column=col, value=value)
    if style_from is not None:
        copy_style(ws.cell(row=style_from, column=col), cell)
    if wrap:
        al = copy(cell.alignment)
        cell.alignment = Alignment(horizontal=al.horizontal, vertical=al.vertical or "top", wrap_text=True)
    return cell


def fill_syllabus(ws):
    for row in range(2, ws.max_row + 1):
        title = ws.cell(row=row, column=2).value
        if not title:
            continue
        key = title.split("\n")[0].strip()
        if key in GENERAL:
            put(ws, row, 3, GENERAL[key])
    # Row heights for the long text rows.
    for row, height in ((3, 30), (11, 30), (12, 190), (13, 150), (14, 110), (15, 210)):
        ws.row_dimensions[row].height = height


def fill_materials(ws):
    # The template keeps authoring notes below the example rows (from row 9 down).
    # Move them below the material list so that no note is overwritten.
    notes = []
    for row in range(9, ws.max_row + 1):
        for cell in ws[row]:
            if cell.value is not None:
                notes.append((row, cell.column, cell.value, copy(cell._style)))
                cell.value = None
    for i, m in enumerate(MATERIALS):
        row = 2 + i
        put(ws, row, 1, i + 1, style_from=2)
        for col, value in enumerate(m, start=2):
            put(ws, row, col, value, style_from=2)
    offset = max(0, (2 + len(MATERIALS) + 2) - 9)
    for row, col, value, style in notes:
        cell = ws.cell(row=row + offset, column=col, value=value)
        cell._style = style


def fill_clo(ws):
    for i, (name, desc) in enumerate(CLOS):
        row = 2 + i
        put(ws, row, 1, i + 1, style_from=2)
        put(ws, row, 2, name, style_from=2)
        put(ws, row, 3, desc, style_from=2)
        ws.row_dimensions[row].height = 45
    ws.cell(row=11, column=1).value = ("Mapping of CLOs to PLOs of Curriculum BCS_AD (K22A) – to be completed "
                                      "when the program PLO list is confirmed")
    # Clear the example ticks from the template and list every CLO in the matrix.
    for i, (name, _) in enumerate(CLOS):
        row = 14 + i
        put(ws, row, 1, name, style_from=14)
        for col in range(2, 22):
            c = ws.cell(row=row, column=col)
            c.value = None
            copy_style(ws.cell(row=14, column=col), c)


def fill_cq(ws):
    for i, (session, name, question) in enumerate(CQ):
        row = 2 + i
        put(ws, row, 1, i + 1, style_from=2)
        put(ws, row, 2, session, style_from=2)
        put(ws, row, 3, name, style_from=2)
        put(ws, row, 4, question, style_from=2)
    for row in range(2 + len(CQ), ws.max_row + 1):
        for col in range(1, 5):
            ws.cell(row=row, column=col).value = None


def fill_schedule(ws):
    for i, (topic, clo, itu, smat, lmat, stask, ltask) in enumerate(SCHEDULE):
        row = 2 + i
        values = [i + 1, topic, "Offline", clo, itu, smat, lmat, stask, ltask, None, None]
        for col, value in enumerate(values, start=1):
            put(ws, row, col, value, style_from=2)
        ws.row_dimensions[row].height = max(45, 15 * (topic.count("\n") + 2))


def fill_grading(ws):
    for i, g in enumerate(GRADING):
        row = 2 + i
        (comp, typ, weight, part, minv, dur, clo, qtype, num, scope, how, note, ref) = g
        values = [i + 1, comp, typ, weight, part, minv, dur, clo, qtype, num, scope, how, note, ref]
        for col, value in enumerate(values, start=1):
            put(ws, row, col, value, style_from=2)
        ws.row_dimensions[row].height = 150
    total = 2 + len(GRADING)
    put(ws, total, 2, "Total", style_from=2)
    put(ws, total, 4, f"=SUM(D2:D{total - 1})", style_from=2)
    ws.cell(row=total, column=2).font = copy(ws.cell(row=1, column=2).font)


def main():
    wb = openpyxl.load_workbook(TEMPLATE)
    fill_syllabus(wb["Syllabus"])
    fill_materials(wb["Materials"])
    fill_clo(wb["CLO"])
    fill_cq(wb["Constructivist Question"])
    fill_schedule(wb["Schedule"])
    fill_grading(wb["Grading structure"])
    wb.save(OUTPUT)
    print(f"Saved {OUTPUT}")


if __name__ == "__main__":
    main()


# ---------------------------------------------------------------------------
# Markdown export (keeps syllabus/syllabus.md in sync with the workbook)
# ---------------------------------------------------------------------------
def build_markdown(path=ROOT / "syllabus.md"):
    esc = lambda s: str(s).replace("\n", "<br>").replace("|", "\\|")
    L = ["# IDB201 – Introduction to Databases: Course Syllabus", "",
         "> Generated by `syllabus/build_syllabus_xlsx.py` from the same data as "
         "[`IDB201_Syllabus.xlsx`](IDB201_Syllabus.xlsx). **Status: proposal for review by the syllabus council.**", "",
         "## 1. General information", "", "| Item | Details |", "|---|---|"]
    for k in ("Program", "Course Name", "Course Code", "Leaning-Teaching Method", "No of credits", "Degree Level",
              "Time Allocation", "Pre-requisite", "Min GPA to pass", "Scoring scale"):
        L.append(f"| {k.replace('Leaning', 'Learning')} | {esc(GENERAL[k])} |")
    L += ["", "## 2. Description", "", GENERAL["Description"], "",
          "## 3. Student's tasks", "", GENERAL["Student's tasks"], "",
          "## 4. Tools", "", GENERAL["Tools"], "",
          "## 5. Course learning outcomes", "", "| CLO | Description |", "|---|---|"]
    L += [f"| {n} | {esc(d)} |" for n, d in CLOS]
    L += ["", "## 6. Learning materials", "",
          "| # | Material | Purpose | Type | Author | Publisher | Year | Edition | Note |", "|---|---|---|---|---|---|---|---|---|"]
    for i, (desc, purpose, isbn, typ, note, author, pub, year, ed) in enumerate(MATERIALS, 1):
        L.append(f"| {i} | {esc(desc)}{' (ISBN ' + isbn + ')' if isbn else ''} | {purpose} | {typ} | {esc(author)} | {pub} | {year} | {ed} | {esc(note)} |")
    L += ["", "## 7. Assessment", "",
          "| # | Component | Weight | Duration | CLOs | Format | Scope |", "|---|---|---|---|---|---|---|"]
    for i, g in enumerate(GRADING, 1):
        L.append(f"| {i} | {g[0]} | {g[2]}% | {esc(g[5])} | {g[6]} | {esc(g[7])} | {esc(g[9])} |")
    L += ["", "**Completion criteria:** every on-going component > 0; practical exam > 0; final exam ≥ 4; final result ≥ 5.", "",
          "## 8. Schedule (60 sessions × 45 minutes)", "", "| Session | Topic | CLO | ITU | Student's task |", "|---|---|---|---|---|"]
    for i, s in enumerate(SCHEDULE, 1):
        L.append(f"| {i} | {esc(s[0])} | {esc(s[1])} | {esc(s[2])} | {esc(s[5])} |")
    L += ["", "ITU: I = Introduce, T = Teach, U = Utilize.", "",
          "## 9. Constructivist questions", "", "| Session | Name | Question |", "|---|---|---|"]
    L += [f"| {s} | {n} | {esc(q)} |" for s, n, q in CQ]
    path.write_text("\n".join(L) + "\n", encoding="utf-8")
    print(f"Saved {path}")


if __name__ == "__main__":
    build_markdown()
