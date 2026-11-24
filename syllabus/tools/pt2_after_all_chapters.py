"""Course owner's decision (24 Nov 2026, 14:07): Progress test 2 is taken after all chapters are finished.
Applied on top of resequence_syllabus.py.
- PT2 moves from session 47 to session 58 and covers Chapters 6-10 (incl. the self-study of DSC Ch. 18-19).
- Session 47 becomes guided exercises for Chapter 9 with the CQ9 discussion (moved from session 46).
- The two review sessions (58, 59) are merged into session 59 (Chapters 1-10).
Project milestones and presentations (sessions 7, 39, 52, 56-57) are unchanged.
Usage: python pt2_after_all_chapters.py <in.xlsx> <out.xlsx>
"""
import sys
import openpyxl

wb = openpyxl.load_workbook(sys.argv[1])
ws = wb["Schedule"]
row = lambda s: s + 1
def put(s, vals):
    for c, v in zip(range(2, 12), vals):
        ws.cell(row(s), c).value = v

# Session 46: the CQ9 discussion moves to session 47.
t = ws.cell(row(46), 8).value
ws.cell(row(46), 8).value = t.split("\nDiscuss this chapter's constructivist questions")[0]
ws.cell(row(46), 9).value = "Teach Chapter 9"

# Session 47: guided exercises for Chapter 9.
put(47, [
    "Guided exercises: cost of selections, external sorting and join algorithms by hand; size estimates; equivalence rules and expression trees; comparing the estimates with SQL Server execution plans",
    "Offline", "CLO6", "U",
    "- Slides: Chapter 9\n- Textbook: DSC Ch. 15–16 Exercises, pp. 736–739, 789–793",
    "- Exercise solutions",
    "Solve the exercises; compare hand-computed costs with the plans chosen by SQL Server\n"
    "Discuss this chapter's constructivist questions (CQ9.1–CQ9.3); choose one and submit an answer within one week",
    "Guide the exercises; discuss solutions; lead the discussion of the constructivist questions",
    None, None,
])

# Session 58: Progress test 2, after all chapters (last Chapter 10 session is 55).
put(58, [
    "Progress test 2 (Chapters 6–10)\nReview exercises",
    "Offline", "CLO2, CLO5, CLO6, CLO7", "U",
    "- Slides: Chapters 6–10\n- DSC Ch. 6–7; Ch. 13, §13.1–13.3, §13.5; Ch. 14, §14.1–14.3, §14.5, §14.7; Ch. 15, §15.1–15.5; Ch. 16, §16.1–16.2; Ch. 17; self-study Ch. 18–19",
    "- Progress test 2",
    "Review Chapters 6–10 and their self-study readings; take Progress test 2",
    "Run and grade Progress test 2; review the answers",
    None, None,
])

# Session 59: one course review for all chapters.
put(59, [
    "Course review: Chapters 1–10, including the self-study readings (among them DSC Ch. 18–19)",
    "Offline", "CLO1, CLO2, CLO3, CLO4, CLO5, CLO6, CLO7", "U",
    "- Slides: Chapters 1–10\n- Review questions and self-study reading list",
    "- Review questions",
    "Review Chapters 1–10 and the self-study readings",
    "Answer questions; review key results",
    None, None,
])

cq = wb["Constructivist Question"]
for r in range(2, cq.max_row + 1):
    if str(cq.cell(r, 4).value or "").startswith("CQ9."):
        cq.cell(r, 2).value = 47

g = wb["Grading structure"]
for r in range(2, g.max_row + 1):
    if g.cell(r, 2).value == "Progress test 2":
        g.cell(r, 8).value = "CLO2, CLO5, CLO6, CLO7"
        g.cell(r, 11).value = ("- cover Chapters 6–10 (DSC Ch. 6–7; Ch. 13, §13.1–13.3, §13.5; Ch. 14, §14.1–14.3, §14.5, §14.7; "
                               "Ch. 15, §15.1–15.5; Ch. 16, §16.1–16.2; Ch. 17) and their self-study readings, including DSC Ch. 18–19\n"
                               "- taken in session 58, after all chapters have been taught (the last Chapter 10 session is session 55)")
wb.save(sys.argv[2])
print("saved", sys.argv[2])
