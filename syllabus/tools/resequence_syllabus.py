"""Re-sequence the IDB201 schedule after the course owner's decisions of 24 Nov 2026:
1. keep the order SQL (Ch3-5) before E-R (Ch6) and normalization (Ch7);
2. DSC Ch. 18-19 become self-study (no lecture);
3. move Progress test 2 later (after Chapter 9) so that the two tests are further apart and PT2 covers Ch6-9;
4. renumber the sessions accordingly.
Usage: python resequence_syllabus.py <in.xlsx> <out.xlsx>
"""
import sys
from copy import copy
import openpyxl

src, dst = sys.argv[1], sys.argv[2]
wb = openpyxl.load_workbook(src)
ws = wb["Schedule"]
COLS = range(2, 12)          # B..K (A holds the session number)
row = lambda s: s + 1        # session s is on sheet row s+1

old = {s: [ws.cell(row(s), c).value for c in COLS] for s in range(1, 61)}

def put(s, vals):
    for c, v in zip(COLS, vals):
        ws.cell(row(s), c).value = v

# Chapter 8 and 9 move one session earlier (the old PT2 slot, session 40, is freed).
for new_s in range(40, 47):
    put(new_s, old[new_s + 1])

# CLO6 starts at session 40 (I,T); session 41 is no longer a first session.
ws.cell(row(40), 5).value = "I,T"
ws.cell(row(41), 5).value = "T"

# Session 43 (guided exercises Ch8) and 46 (Ch9) keep their CQ discussions; nothing else refers to their numbers.

# Session 47: Progress test 2, right after the last Chapter 9 lecture.
put(47, [
    "Progress test 2 (Chapters 6–9)\nReview exercises",
    "Offline",
    "CLO2, CLO5, CLO6",
    "U",
    "- Slides: Chapters 6–9\n- DSC Ch. 6–7; Ch. 13, §13.1–13.3, §13.5; Ch. 14, §14.1–14.3, §14.5, §14.7; Ch. 15, §15.1–15.5; Ch. 16, §16.1–16.2",
    "- Progress test 2",
    "Review Chapters 6–9 and their self-study readings; take Progress test 2",
    "Run and grade Progress test 2; review the answers",
    None, None,
])

# Session 51: Chapter 17 only; two-phase locking etc. become self-study.
put(51, [
    "17.7 Recoverable and cascadeless schedules\n17.8 Transaction isolation levels\n17.9 Implementation of isolation levels",
    "Offline", "CLO7", "T",
    "- Slides: Chapter 10\n- Textbook: DSC Ch. 17, §17.7–17.9, pp. 819–827",
    "- Syllabus IDB201\n- Slides: Chapter 10\n- Textbook [DSC]",
    "Read DSC Ch. 17, §17.7–17.9, pp. 819–827 before class\n"
    "Self-study (required, prepares Lab 5 part 2): DSC Ch. 18, §18.1 Lock-based protocols (two-phase locking), pp. 835–848; "
    "§18.2 Deadlock handling, pp. 849–852; §18.4 Insert operations, delete operations and predicate reads (phantoms), pp. 857–860",
    "Teach Chapter 10; set the self-study of Chapter 18",
    None, None,
])

# Session 53: guided exercises replace the Chapter 18 lecture.
put(53, [
    "Guided exercises: conflict serializability and precedence graphs, recoverable and cascadeless schedules, isolation levels\n"
    "Questions on the self-study of DSC Ch. 18 (two-phase locking, deadlocks, phantoms, snapshot isolation) in preparation for Lab 5 part 2",
    "Offline", "CLO7", "T",
    "- Slides: Chapter 10\n- Textbook: DSC Ch. 17 Exercises, pp. 831–833; self-study DSC Ch. 18, §18.1–18.2, §18.4, §18.8",
    "- Exercise solutions",
    "Solve the exercises; bring questions on the Chapter 18 self-study\n"
    "Self-study: DSC §18.8 Snapshot isolation, pp. 872–879; optional: §18.3 Multiple granularity, pp. 853–856; "
    "§18.5 Timestamp-based protocols, pp. 861–865; §18.7 Multiversion schemes, pp. 869–871; §18.9 Weak levels of consistency in practice, pp. 880–882",
    "Guide the exercises; answer questions on the self-study of Chapter 18",
    None, None,
])

# Session 55: CQ discussion and questions on the self-study of Chapters 18-19 replace the Chapter 19 lecture.
put(55, [
    "Discussion of the Chapter 10 constructivist questions (CQ10.1–CQ10.3)\n"
    "Questions on the self-study of DSC Ch. 18–19 (two-phase locking and the lock point; failure classification, write-ahead logging, main ideas of the recovery algorithm)",
    "Offline", "CLO7", "T",
    "- Slides: Chapter 10\n- Textbook: self-study DSC Ch. 18, §18.1; Ch. 19, §19.1, §19.3–19.4, pp. 907, 912–925",
    "- Syllabus IDB201\n- Slides: Chapter 10\n- Textbook [DSC]",
    "Self-study before class: DSC Ch. 19, §19.1 Failure classification, p. 907; §19.3 Recovery and atomicity (write-ahead logging), pp. 912–921; "
    "§19.4 Recovery algorithm, pp. 922–925; optional: §19.2 Storage, pp. 908–911; §19.5–19.6, pp. 926–930\n"
    "Discuss this chapter's constructivist questions (CQ10.1–CQ10.3); choose one and submit an answer within one week",
    "Lead the discussion of the constructivist questions; answer questions on the self-study of Chapters 18–19",
    None, None,
])

# Session 59: review wording.
ws.cell(row(59), 2).value = "Course review (part 2): Chapters 8–10, including the self-study of DSC Ch. 18–19 (concurrency control and recovery)"
ws.cell(row(59), 8).value = "Review Chapters 8–10 and the self-study readings, including DSC Ch. 18–19"

# Constructivist questions: CQ8.x now in session 43, CQ9.x in session 46 (CQ10.x stays in 55).
cq = wb["Constructivist Question"]
for r in range(2, cq.max_row + 1):
    name = str(cq.cell(r, 4).value or "")
    if name.startswith("CQ8."):
        cq.cell(r, 2).value = 43
    elif name.startswith("CQ9."):
        cq.cell(r, 2).value = 46

# Grading structure: Progress test 2 now covers Chapters 6-9.
g = wb["Grading structure"]
for r in range(2, g.max_row + 1):
    if g.cell(r, 2).value == "Progress test 2":
        g.cell(r, 8).value = "CLO2, CLO5, CLO6"
        g.cell(r, 11).value = ("- cover Chapters 6–9 (DSC Ch. 6–7; Ch. 13, §13.1–13.3, §13.5; Ch. 14, §14.1–14.3, §14.5, §14.7; "
                               "Ch. 15, §15.1–15.5; Ch. 16, §16.1–16.2) and their self-study sections\n- taken in session 47, right after the last lecture of Chapter 9")
    if g.cell(r, 2).value == "Progress test 1":
        k = g.cell(r, 11).value or ""
        if "session 26" not in k:
            g.cell(r, 11).value = k.rstrip() + "\n- taken in session 26, right after the last lecture of Chapter 5"
    if g.cell(r, 2).value == "Final exam":
        k = g.cell(r, 11).value or ""
        if "Ch. 18–19" not in k:
            g.cell(r, 11).value = k.replace("including the self-study readings (about 20% of items)", "including the self-study readings, among them DSC Ch. 18–19 (about 20% of items)")

wb.save(dst)
print("saved", dst)
