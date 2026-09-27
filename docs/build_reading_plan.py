"""Build the DSC (7th ed.) reading plan for IDB201.

It classifies every chapter and section of Silberschatz, Korth & Sudarshan,
*Database System Concepts*, 7th ed. (2020), into:

  IN CLASS    taught in the 60 x 45-minute sessions
  SELF-STUDY  required guided self-study (reading + exercises, checked in labs/tests)
  OPTIONAL    optional reading / possible Assignment 2 research topic
  LATER       outside IDB201; covered by a later course of the BCS_AD program

Section numbers, titles and start pages come from the book's table of contents
(provided by the course owner). Page ranges run to the page before the next entry.

Usage:  pip install openpyxl && python docs/build_reading_plan.py
Output: docs/IDB201_DSC_Reading_Plan.xlsx
"""
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

OUT = Path(__file__).resolve().parent / "IDB201_DSC_Reading_Plan.xlsx"

IN, SELF, OPT, LATER = "IN CLASS", "SELF-STUDY", "OPTIONAL", "LATER"
FILL = {IN: "C6EFCE", SELF: "FFEB9C", OPT: "DDEBF7", LATER: "E7E6E6"}
LABEL_VI = {IN: "Học trên lớp", SELF: "Tự học có hướng dẫn (bắt buộc)",
            OPT: "Đọc thêm / đề tài nghiên cứu", LATER: "Ngoài phạm vi – học ở môn sau"}

# (chapter, title, part, next_chapter_start, chapter decision, IDB201 chapter, sessions, rationale,
#  [(section, title, start_page, category, note)])
BOOK = [
 (1, "Introduction", "–", 37, IN, "C1", "1–3",
  "Foundations for every later chapter (CLO1).",
  [("1.1", "Database-System Applications", 1, IN, ""),
   ("1.2", "Purpose of Database Systems", 5, IN, ""),
   ("1.3", "View of Data", 8, IN, "Data models, three-schema architecture, data independence"),
   ("1.4", "Database Languages", 13, IN, ""),
   ("1.5", "Database Design", 17, IN, ""),
   ("1.6", "Database Engine", 18, IN, ""),
   ("1.7", "Database and Application Architecture", 21, IN, ""),
   ("1.8", "Database Users and Administrators", 24, SELF, "Short descriptive reading"),
   ("1.9", "History of Database Systems", 25, SELF, "Supports the Research Corner of Chapter 1"),
   ("1.10", "Summary, Exercises, Further Reading", 29, SELF, "")]),
 (2, "Introduction to the Relational Model", "Part One – Relational Languages", 65, IN, "C2", "4–8",
  "Relational model and relational algebra: core CS theory (CLO2, CLO3).",
  [("2.1", "Structure of Relational Databases", 37, IN, ""),
   ("2.2", "Database Schema", 41, IN, ""),
   ("2.3", "Keys", 43, IN, ""),
   ("2.4", "Schema Diagrams", 46, IN, ""),
   ("2.5", "Relational Query Languages", 47, IN, ""),
   ("2.6", "The Relational Algebra", 48, IN, "Sessions 5–6"),
   ("2.7", "Summary, Exercises, Further Reading", 58, SELF, "")]),
 (3, "Introduction to SQL", "Part One – Relational Languages", 125, IN, "C3", "9–14",
  "SQL is required in every later data course (CLO4).",
  [("3.1", "Overview of the SQL Query Language", 65, IN, ""),
   ("3.2", "SQL Data Definition", 66, IN, ""),
   ("3.3", "Basic Structure of SQL Queries", 71, IN, ""),
   ("3.4", "Additional Basic Operations", 79, IN, ""),
   ("3.5", "Set Operations", 85, IN, ""),
   ("3.6", "Null Values", 89, IN, "Three-valued logic (Ch. 6 semantics)"),
   ("3.7", "Aggregate Functions", 91, IN, ""),
   ("3.8", "Nested Subqueries", 98, IN, ""),
   ("3.9", "Modification of the Database", 108, IN, ""),
   ("3.10", "Summary, Exercises, Further Reading", 114, SELF, "Exercises used in Lab 5")]),
 (4, "Intermediate SQL", "Part One – Relational Languages", 183, IN, "C4", "15–19",
  "Joins, views, constraints and data types (CLO2, CLO4).",
  [("4.1", "Join Expressions", 125, IN, ""),
   ("4.2", "Views", 137, IN, ""),
   ("4.3", "Transactions", 143, IN, "Short preview of Chapter 17"),
   ("4.4", "Integrity Constraints", 145, IN, ""),
   ("4.5", "SQL Data Types and Schemas", 153, IN, ""),
   ("4.6", "Index Definition in SQL", 164, IN, "Session 17"),
   ("4.7", "Authorization", 165, SELF, "Basis for DPY391 Data Security and Privacy (S5)"),
   ("4.8", "Summary, Exercises, Further Reading", 173, SELF, "")]),
 (5, "Advanced SQL", "Part One – Relational Languages", 241, SELF, "C4", "17–18",
  "Only the parts that support the academic goals are taught; procedural SQL is optional.",
  [("5.1", "Accessing SQL from a Programming Language", 183, IN, "Python section (session 18); JDBC/ODBC self-study"),
   ("5.2", "Functions and Procedures", 198, OPT, "Optional Appendix A; useful for the project"),
   ("5.3", "Triggers", 206, OPT, "Optional Appendix A"),
   ("5.4", "Recursive Queries", 213, IN, "Transitive closure and expressive power (session 17)"),
   ("5.5", "Advanced Aggregation Features", 219, SELF, "Ranking and windowing; used in DSI201 (S3)"),
   ("5.6", "Summary, Exercises, Further Reading", 231, SELF, "")]),
 (6, "Database Design Using the E-R Model", "Part Two – Database Design", 303, IN, "C5", "21–25",
  "Conceptual design and ER-to-relational mapping (CLO2).",
  [("6.1", "Overview of the Design Process", 241, IN, ""),
   ("6.2", "The Entity-Relationship Model", 244, IN, ""),
   ("6.3", "Complex Attributes", 249, IN, ""),
   ("6.4", "Mapping Cardinalities", 252, IN, ""),
   ("6.5", "Primary Key", 256, IN, ""),
   ("6.6", "Removing Redundant Attributes in Entity Sets", 261, IN, ""),
   ("6.7", "Reducing E-R Diagrams to Relational Schemas", 264, IN, "Session 23"),
   ("6.8", "Extended E-R Features", 271, SELF, "Specialization/generalization; practised in Lab 2"),
   ("6.9", "Entity-Relationship Design Issues", 279, IN, ""),
   ("6.10", "Alternative Notations for Modeling Data", 285, SELF, "Crow's foot and UML reference"),
   ("6.11", "Other Aspects of Database Design", 291, SELF, ""),
   ("6.12", "Summary, Exercises, Further Reading", 292, SELF, "")]),
 (7, "Relational Database Design", "Part Two – Database Design", 365, IN, "C6", "26–32",
  "Dependency theory with proofs: the most theoretical part of the course (CLO5).",
  [("7.1", "Features of Good Relational Designs", 303, IN, ""),
   ("7.2", "Decomposition Using Functional Dependencies", 308, IN, ""),
   ("7.3", "Normal Forms", 313, IN, ""),
   ("7.4", "Functional-Dependency Theory", 320, IN, "Closure, Armstrong's axioms, canonical cover"),
   ("7.5", "Algorithms for Decomposition Using Functional Dependencies", 330, IN, "3NF synthesis, BCNF decomposition"),
   ("7.6", "Decomposition Using Multivalued Dependencies", 336, IN, "MVDs and 4NF, overview (session 31)"),
   ("7.7", "More Normal Forms", 341, OPT, "5NF, PJNF"),
   ("7.8", "Atomic Domains and First Normal Form", 342, IN, ""),
   ("7.9", "Database-Design Process", 343, SELF, ""),
   ("7.10", "Modeling Temporal Data", 347, OPT, ""),
   ("7.11", "Summary, Exercises, Further Reading", 351, SELF, "Exercises used in Lab 7")]),
 (8, "Complex Data Types", "Part Three – Application Design and Development", 403, OPT, "–", "–",
  "Not in the official description; semi-structured data (JSON) is useful background for DSI201.",
  [("8.1", "Semi-structured Data", 365, OPT, "JSON; recommended for the DS track"),
   ("8.2", "Object Orientation", 376, LATER, ""),
   ("8.3", "Textual Data", 382, LATER, "Covered by DAM311 / NLP401"),
   ("8.4", "Spatial Data", 387, LATER, ""),
   ("8.5", "Summary, Exercises, Further Reading", 394, LATER, "")]),
 (9, "Application Development", "Part Three – Application Design and Development", 467, LATER, "–", "–",
  "Web application development is application-oriented, so it is outside this academic course. Only security is read.",
  [("9.1", "Application Programs and User Interfaces", 403, LATER, ""),
   ("9.2", "Web Fundamentals", 405, LATER, ""),
   ("9.3", "Servlets", 411, LATER, ""),
   ("9.4", "Alternative Server-Side Frameworks", 416, LATER, ""),
   ("9.5", "Client-Side Code and Web Services", 421, LATER, ""),
   ("9.6", "Application Architectures", 429, LATER, ""),
   ("9.7", "Application Performance", 434, LATER, ""),
   ("9.8", "Application Security", 437, SELF, "SQL injection (session 18); basis for DPY391"),
   ("9.9", "Encryption and Its Applications", 447, LATER, "Covered by DPY391 (S5)"),
   ("9.10", "Summary, Exercises, Further Reading", 453, LATER, "")]),
 (10, "Big Data", "Part Four – Big Data Analytics", 519, LATER, "–", "–",
  "Covered by BDI302c Big Data (S8) and MLD301 (S7).",
  [("10.1", "Motivation", 467, OPT, "Short motivating reading"),
   ("10.2", "Big Data Storage Systems", 472, LATER, ""),
   ("10.3", "The MapReduce Paradigm", 483, LATER, ""),
   ("10.4", "Beyond MapReduce: Algebraic Operations", 494, OPT, "Links relational algebra to Spark; possible research topic"),
   ("10.5", "Streaming Data", 500, LATER, ""),
   ("10.6", "Graph Databases", 508, LATER, ""),
   ("10.7", "Summary, Exercises, Further Reading", 511, LATER, "")]),
 (11, "Data Analytics", "Part Four – Big Data Analytics", 559, LATER, "–", "–",
  "Covered by DSI201 (S3), DAM311 (S4) and DVI301 (S5).",
  [("11.1", "Overview of Analytics", 519, LATER, ""),
   ("11.2", "Data Warehousing", 521, OPT, "Optional; star schemas as a design case"),
   ("11.3", "Online Analytical Processing", 527, LATER, ""),
   ("11.4", "Data Mining", 540, LATER, "DAM311"),
   ("11.5", "Summary, Exercises, Further Reading", 550, LATER, "")]),
 (12, "Physical Storage Systems", "Part Five – Storage Management and Indexing", 587, SELF, "C7", "35",
  "Hardware details overlap with ICS102; only what the I/O cost model needs is read.",
  [("12.1", "Overview of Physical Storage Media", 559, SELF, "Memory hierarchy (with ICS102)"),
   ("12.2", "Storage Interfaces", 562, LATER, ""),
   ("12.3", "Magnetic Disks", 563, OPT, ""),
   ("12.4", "Flash Memory", 567, OPT, ""),
   ("12.5", "RAID", 570, LATER, ""),
   ("12.6", "Disk-Block Access", 577, SELF, "Needed for the I/O cost model"),
   ("12.7", "Summary, Exercises, Further Reading", 580, LATER, "")]),
 (13, "Data Storage Structures", "Part Five – Storage Management and Indexing", 623, IN, "C7", "35–36",
  "Pages, records and the buffer: basis of the cost model (CLO6).",
  [("13.1", "Database Storage Architecture", 587, IN, ""),
   ("13.2", "File Organization", 588, IN, ""),
   ("13.3", "Organization of Records in Files", 595, IN, ""),
   ("13.4", "Data-Dictionary Storage", 602, SELF, ""),
   ("13.5", "Database Buffer", 604, IN, ""),
   ("13.6", "Column-Oriented Storage", 611, OPT, "Relevant to analytics; possible research topic"),
   ("13.7", "Storage Organization in Main-Memory Databases", 615, OPT, ""),
   ("13.8", "Summary, Exercises, Further Reading", 617, SELF, "")]),
 (14, "Indexing", "Part Five – Storage Management and Indexing", 689, IN, "C7", "36–40",
  "B+-trees and hashing: official description names indexing (CLO6).",
  [("14.1", "Basic Concepts", 623, IN, ""),
   ("14.2", "Ordered Indices", 625, IN, ""),
   ("14.3", "B+-Tree Index Files", 634, IN, ""),
   ("14.4", "B+-Tree Extensions", 650, SELF, ""),
   ("14.5", "Hash Indices", 658, IN, ""),
   ("14.6", "Multiple-Key Access", 661, IN, "Composite indexes (Lab 7)"),
   ("14.7", "Creation of Indices", 664, IN, ""),
   ("14.8", "Write-Optimized Index Structures", 665, OPT, "LSM trees; possible research topic"),
   ("14.9", "Bitmap Indices", 670, OPT, ""),
   ("14.10", "Indexing of Spatial and Temporal Data", 672, LATER, ""),
   ("14.11", "Summary, Exercises, Further Reading", 677, SELF, "")]),
 (15, "Query Processing", "Part Six – Query Processing and Optimization", 743, IN, "C8", "41–43, 46",
  "Cost of selection, sorting and joins (CLO6).",
  [("15.1", "Overview", 689, IN, ""),
   ("15.2", "Measures of Query Cost", 692, IN, ""),
   ("15.3", "Selection Operation", 695, IN, ""),
   ("15.4", "Sorting", 701, IN, "External merge sort"),
   ("15.5", "Join Operation", 704, IN, "Nested-loop, merge and hash joins"),
   ("15.6", "Other Operations", 719, SELF, ""),
   ("15.7", "Evaluation of Expressions", 724, SELF, "Materialization and pipelining"),
   ("15.8", "Query Processing in Memory", 731, OPT, ""),
   ("15.9", "Summary, Exercises, Further Reading", 734, SELF, "")]),
 (16, "Query Optimization", "Part Six – Query Processing and Optimization", 799, IN, "C8", "44–46",
  "Equivalence rules, estimation and join ordering (CLO6); official description names query optimization.",
  [("16.1", "Overview", 743, IN, ""),
   ("16.2", "Transformation of Relational Expressions", 747, IN, "Equivalence rules"),
   ("16.3", "Estimating Statistics of Expression Results", 757, SELF, "Abstract; guided self-study"),
   ("16.4", "Choice of Evaluation Plans", 766, IN, "Dynamic programming for join order"),
   ("16.5", "Materialized Views", 778, OPT, "Links to views (Ch. 7 of the course)"),
   ("16.6", "Advanced Topics in Query Optimization", 783, LATER, ""),
   ("16.7", "Summary, Exercises, Further Reading", 787, SELF, "")]),
 (17, "Transactions", "Part Seven – Transaction Management", 835, IN, "C9", "47–49, 53",
  "ACID, serializability, recoverability, isolation (CLO7).",
  [("17.1", "Transaction Concept", 799, IN, ""),
   ("17.2", "A Simple Transaction Model", 801, IN, ""),
   ("17.3", "Storage Structure", 804, SELF, ""),
   ("17.4", "Transaction Atomicity and Durability", 805, IN, ""),
   ("17.5", "Transaction Isolation", 807, IN, ""),
   ("17.6", "Serializability", 812, IN, "Precedence graphs"),
   ("17.7", "Transaction Isolation and Atomicity", 819, IN, "Recoverable and cascadeless schedules"),
   ("17.8", "Transaction Isolation Levels", 821, IN, ""),
   ("17.9", "Implementation of Isolation Levels", 823, IN, ""),
   ("17.10", "Transactions as SQL Statements", 826, IN, ""),
   ("17.11", "Summary, Exercises, Further Reading", 828, SELF, "")]),
 (18, "Concurrency Control", "Part Seven – Transaction Management", 907, IN, "C9", "50–53",
  "Two-phase locking, deadlocks, snapshot isolation (CLO7). Other protocols are self-study.",
  [("18.1", "Lock-Based Protocols", 835, IN, "2PL and its correctness"),
   ("18.2", "Deadlock Handling", 849, IN, ""),
   ("18.3", "Multiple Granularity", 853, SELF, ""),
   ("18.4", "Insert Operations, Delete Operations, and Predicate Reads", 857, IN, "Phantoms, brief"),
   ("18.5", "Timestamp-Based Protocols", 861, SELF, ""),
   ("18.6", "Validation-Based Protocols", 866, OPT, ""),
   ("18.7", "Multiversion Schemes", 869, SELF, "Background for snapshot isolation"),
   ("18.8", "Snapshot Isolation", 872, IN, "Write skew"),
   ("18.9", "Weak Levels of Consistency in Practice", 880, SELF, ""),
   ("18.10", "Advanced Topics in Concurrency Control", 883, LATER, ""),
   ("18.11", "Summary, Exercises, Further Reading", 894, SELF, "")]),
 (19, "Recovery System", "Part Seven – Transaction Management", 961, SELF, "C10", "54",
  "Abstract and hard to reproduce in a lab: one overview session (54), the rest is guided self-study (CLO7).",
  [("19.1", "Failure Classification", 907, IN, ""),
   ("19.2", "Storage", 908, SELF, ""),
   ("19.3", "Recovery and Atomicity", 912, IN, "Write-ahead logging (overview, session 54)"),
   ("19.4", "Recovery Algorithm", 922, SELF, "Main ideas introduced in session 54; details self-study"),
   ("19.5", "Buffer Management", 926, SELF, ""),
   ("19.6", "Failure with Loss of Non-Volatile Storage", 930, SELF, ""),
   ("19.7", "High Availability Using Remote Backup Systems", 931, LATER, ""),
   ("19.8", "Early Lock Release and Logical Undo Operations", 935, LATER, ""),
   ("19.9", "ARIES", 941, OPT, "Research Corner reading for strong students"),
   ("19.10", "Recovery in Main-Memory Databases", 947, LATER, ""),
   ("19.11", "Summary, Exercises, Further Reading", 948, SELF, "")]),
 (20, "Database-System Architectures", "Part Eight – Parallel and Distributed Databases", 1003, LATER, "–", "–",
  "Parallel and distributed systems go beyond an S1 course; partly covered by BDI302c (S8).",
  [("20.1–20.8", "Whole chapter", 961, LATER, "20.2–20.3 may be skimmed as optional context")]),
 (21, "Parallel and Distributed Storage", "Part Eight – Parallel and Distributed Databases", 1039, LATER, "–", "–",
  "Partly covered by BDI302c (S8).",
  [("21.1–21.8", "Whole chapter", 1003, LATER, "")]),
 (22, "Parallel and Distributed Query Processing", "Part Eight – Parallel and Distributed Databases", 1098, LATER, "–", "–",
  "Partly covered by BDI302c (S8).",
  [("22.1–22.10", "Whole chapter", 1039, LATER, "")]),
 (23, "Parallel and Distributed Transaction Processing", "Part Eight – Parallel and Distributed Databases", 1175, LATER, "–", "–",
  "Beyond the scope of the program's required courses; possible topic for the capstone.",
  [("23.1–23.9", "Whole chapter", 1098, LATER, "")]),
 (24, "Advanced Indexing Techniques", "Part Nine – Advanced Topics", 1210, OPT, "C7", "Assignment 2",
  "Good material for Assignment 2 research topics.",
  [("24.1", "Bloom Filter", 1175, OPT, "Also used in MLD301 (S7)"),
   ("24.2", "Log-Structured Merge Tree and Variants", 1176, OPT, "Research topic"),
   ("24.3", "Bitmap Indices", 1182, OPT, ""),
   ("24.4", "Indexing of Spatial Data", 1186, LATER, ""),
   ("24.5", "Hash Indices", 1190, OPT, "Extendible and linear hashing"),
   ("24.6", "Summary, Exercises, Further Reading", 1203, OPT, "")]),
 (25, "Advanced Application Development", "Part Nine – Advanced Topics", 1252, LATER, "–", "–",
  "Performance tuning and benchmarks are application-oriented.",
  [("25.1", "Performance Tuning", 1210, OPT, "Useful background for the Lab 8 experiments"),
   ("25.2", "Performance Benchmarks", 1230, OPT, "How to design fair experiments (Assignment 2)"),
   ("25.3–25.6", "Other issues, standardization, directory systems", 1234, LATER, "")]),
 (26, "Blockchain Databases", "Part Nine – Advanced Topics", 1287, LATER, "–", "–",
  "Not part of the program's database track.",
  [("26.1–26.9", "Whole chapter", 1252, LATER, "")]),
 ("A", "Detailed University Schema", "Part Ten – Appendix", 1299, SELF, "All", "Labs",
  "The book's running example; the course's UniversityDB follows the same idea.",
  [("A", "Detailed University Schema", 1287, SELF, "Reference for labs and examples")]),
 (27, "Formal Relational Query Languages (online)", "Part Eleven – Online Chapters", None, SELF, "C2", "6, 8",
  "Relational calculus is abstract and hard to experiment with, so it is guided self-study with a worksheet (CLO3).",
  [("27.x", "Tuple and domain relational calculus", None, SELF, "Guided self-study with a worksheet; reviewed in session 8")]),
 (28, "Advanced Relational Database Design (online)", "Part Eleven – Online Chapters", None, OPT, "C6", "–",
  "Deeper dependency theory for strong students.",
  [("28.x", "Whole chapter", None, OPT, "")]),
 (29, "Object-Based Databases (online)", "Part Eleven – Online Chapters", None, LATER, "–", "–", "", [("29.x", "Whole chapter", None, LATER, "")]),
 (30, "XML (online)", "Part Eleven – Online Chapters", None, LATER, "–", "–", "", [("30.x", "Whole chapter", None, LATER, "")]),
 (31, "Information Retrieval (online)", "Part Eleven – Online Chapters", None, LATER, "–", "–", "Covered by DAM311 / NLP401.", [("31.x", "Whole chapter", None, LATER, "")]),
 (32, "PostgreSQL (online)", "Part Eleven – Online Chapters", None, OPT, "–", "–",
  "The course uses SQL Server; this chapter shows how a real open-source DBMS implements the theory.",
  [("32.x", "Whole chapter", None, OPT, "")]),
]


def page_ranges():
    rows = []
    for ch, title, part, nxt, cdec, idb, sess, why, secs in BOOK:
        for i, (num, stitle, start, cat, note) in enumerate(secs):
            end = None
            if start is not None:
                end = (secs[i + 1][2] - 1) if i + 1 < len(secs) else (nxt - 1 if nxt else None)
            pages = (end - start + 1) if (start and end) else None
            rows.append((ch, title, part, num, stitle, start, end, pages, cat, note))
    return rows


def style_header(ws, row, ncol):
    for c in range(1, ncol + 1):
        cell = ws.cell(row=row, column=c)
        cell.font = Font(bold=True, color="FFFFFF")
        cell.fill = PatternFill("solid", fgColor="1F4E79")
        cell.alignment = Alignment(wrap_text=True, vertical="center")


def main():
    thin = Side(style="thin", color="A6A6A6")
    border = Border(left=thin, right=thin, top=thin, bottom=thin)
    rows = page_ranges()
    wb = Workbook()

    # Sheet 1: summary
    ws = wb.active
    ws.title = "Summary"
    ws["A1"] = "IDB201 – Reading plan for Database System Concepts, 7th ed. (Silberschatz, Korth & Sudarshan, 2020)"
    ws["A1"].font = Font(bold=True, size=13, color="1F4E79")
    ws["A2"] = "Course: 60 sessions × 45 minutes (45 contact hours) + 104 hours of self-study. Page counts cover the printed chapters 1–26 and Appendix A."
    hdr = ["Category", "Meaning (VI)", "Sections", "Pages", "Share of printed pages"]
    for c, h in enumerate(hdr, 1):
        ws.cell(row=4, column=c, value=h)
    style_header(ws, 4, len(hdr))
    total = sum(r[7] or 0 for r in rows)
    for i, cat in enumerate((IN, SELF, OPT, LATER)):
        r = 5 + i
        n = sum(1 for x in rows if x[8] == cat)
        p = sum(x[7] or 0 for x in rows if x[8] == cat)
        vals = [cat, LABEL_VI[cat], n, p, p / total]
        for c, v in enumerate(vals, 1):
            cell = ws.cell(row=r, column=c, value=v)
            cell.fill = PatternFill("solid", fgColor=FILL[cat])
            cell.border = border
        ws.cell(row=r, column=5).number_format = "0%"
    ws.cell(row=9, column=1, value="Total").font = Font(bold=True)
    ws.cell(row=9, column=4, value=total).font = Font(bold=True)
    notes = [
        "How to read this workbook:",
        "• 'Chapters' gives one decision per chapter, the matching IDB201 chapter, the sessions and the reason.",
        "• 'Sections' gives the decision for every section with its page range, so the syllabus can cite exact pages.",
        "• IN CLASS pages average about 14 pages per theory session; students read them before class (flipped preparation).",
        "• SELF-STUDY is required and is checked through labs, progress tests and the final exam.",
        "• OPTIONAL sections are enrichment for honors students and feed Assignment 2 research topics.",
        "• LATER marks material that belongs to later BCS_AD courses (DSI201, DAM311, DPY391, BDI302c, MLD301).",
        "• Online chapters 27–32 have no page numbers in the printed table of contents.",
    ]
    for i, t in enumerate(notes):
        ws.cell(row=11 + i, column=1, value=t)
    ws.cell(row=11, column=1).font = Font(bold=True)
    for col, w in zip("ABCDE", (16, 34, 10, 10, 20)):
        ws.column_dimensions[col].width = w

    # Sheet 2: chapters
    wc = wb.create_sheet("Chapters")
    hdr = ["Ch.", "Title", "Part", "Pages", "Decision", "IDB201 chapter", "Sessions", "In-class pages", "Reason / later course"]
    for c, h in enumerate(hdr, 1):
        wc.cell(row=1, column=c, value=h)
    style_header(wc, 1, len(hdr))
    for i, (ch, title, part, nxt, cdec, idb, sess, why, secs) in enumerate(BOOK):
        r = 2 + i
        chrows = [x for x in rows if x[0] == ch]
        start = secs[0][2]
        pages = f"{start}–{nxt - 1}" if (start and nxt) else "online"
        inpages = sum(x[7] or 0 for x in chrows if x[8] == IN)
        vals = [ch, title, part, pages, cdec, idb, sess, inpages or "", why]
        for c, v in enumerate(vals, 1):
            cell = wc.cell(row=r, column=c, value=v)
            cell.border = border
            cell.alignment = Alignment(wrap_text=True, vertical="top")
        wc.cell(row=r, column=5).fill = PatternFill("solid", fgColor=FILL[cdec])
    for col, w in zip("ABCDEFGHI", (5, 38, 30, 11, 12, 14, 14, 10, 60)):
        wc.column_dimensions[col].width = w
    wc.freeze_panes = "A2"

    # Sheet 3: sections
    wsx = wb.create_sheet("Sections")
    hdr = ["Ch.", "Chapter title", "Section", "Section title", "From page", "To page", "Pages", "Decision", "Decision (VI)", "Note"]
    for c, h in enumerate(hdr, 1):
        wsx.cell(row=1, column=c, value=h)
    style_header(wsx, 1, len(hdr))
    for i, (ch, title, part, num, stitle, start, end, pages, cat, note) in enumerate(rows):
        r = 2 + i
        vals = [ch, title, num, stitle, start, end, pages, cat, LABEL_VI[cat], note]
        for c, v in enumerate(vals, 1):
            cell = wsx.cell(row=r, column=c, value=v)
            cell.border = border
            cell.alignment = Alignment(wrap_text=True, vertical="top")
        for c in (8, 9):
            wsx.cell(row=r, column=c).fill = PatternFill("solid", fgColor=FILL[cat])
    for col, w in zip("ABCDEFGHIJ", (5, 30, 9, 44, 9, 9, 7, 12, 26, 50)):
        wsx.column_dimensions[col].width = w
    wsx.freeze_panes = "A2"
    wsx.auto_filter.ref = f"A1:{get_column_letter(len(hdr))}{len(rows) + 1}"

    # Sheet 4: session load (in-class pages per theory session, current syllabus)
    wl = wb.create_sheet("Session load")
    hdr = ["IDB201 chapter", "DSC chapters", "In-class pages", "Theory sessions", "Pages per session", "Verdict"]
    for c, h in enumerate(hdr, 1):
        wl.cell(row=1, column=c, value=h)
    style_header(wl, 1, len(hdr))
    load = [  # (course chapter, DSC chapters used in class, theory sessions)
        ("C1 Introduction", [1], "1–2", 2),
        ("C2 Relational model and algebra", [2], "4–6", 3),
        ("C3 Introduction to SQL", [3], "9–12", 4),
        ("C4 Intermediate and advanced SQL", [4, 5], "15–18", 4),
        ("C5 E-R model", [6], "21–24", 4),
        ("C6 Relational database design", [7], "26–31", 6),
        ("C7 Storage and indexing", [12, 13, 14], "35–38", 4),
        ("C8 Query processing and optimization", [15, 16], "41–45", 5),
        ("C9 Transactions and concurrency", [17, 18], "47–52", 6),
        ("C10 Recovery (mainly self-study)", [19], "54", 1),
    ]
    for i, (chap, dsc, sess, n) in enumerate(load):
        r = 2 + i
        pages = sum(x[7] or 0 for x in rows if x[0] in dsc and x[8] == IN)
        per = round(pages / n, 1)
        verdict = "OK" if per <= 16 else "Heavy"
        vals = [chap, ", ".join(f"Ch. {d}" for d in dsc), pages, f"{sess} ({n})", per, verdict]
        for c, v in enumerate(vals, 1):
            cell = wl.cell(row=r, column=c, value=v)
            cell.border = border
            cell.alignment = Alignment(wrap_text=True, vertical="top")
        wl.cell(row=r, column=6).fill = PatternFill("solid", fgColor="C6EFCE" if verdict == "OK" else "FFC7CE")
    wl.cell(row=13, column=1, value="In-class pages are read before class; each theory session is 45 minutes.")
    for col, w in zip("ABCDEF", (36, 20, 14, 18, 16, 10)):
        wl.column_dimensions[col].width = w

    wb.save(OUT)
    print(f"Saved {OUT}")
    for cat in (IN, SELF, OPT, LATER):
        print(cat, sum(x[7] or 0 for x in rows if x[8] == cat), "pages,", sum(1 for x in rows if x[8] == cat), "sections")
    print("total", total)


if __name__ == "__main__":
    main()
