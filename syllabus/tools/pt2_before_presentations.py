"""Course owner's decision (24 Nov 2026, 14:44): Progress test 2 comes before the project presentations,
but still after Chapter 10 (whose last session is 55).
- Session 56: Progress test 2 (moved from session 58).
- Sessions 57-58: final presentations (moved from 56-57); the report is due three days before session 57.
Applied on top of pt2_after_all_chapters.py.
Usage: python pt2_before_presentations.py <in.xlsx> <out.xlsx>
"""
import sys
import openpyxl

wb = openpyxl.load_workbook(sys.argv[1])
ws = wb["Schedule"]
row = lambda s: s + 1
COLS = range(2, 12)
get = lambda s: [ws.cell(row(s), c).value for c in COLS]
def put(s, vals):
    for c, v in zip(COLS, vals):
        ws.cell(row(s), c).value = v

pt2, pres1, pres2 = get(58), get(56), get(57)
assert pt2[0].startswith("Progress test 2") and "presentations (part 1)" in pres1[0] and "presentations (part 2)" in pres2[0]
pres1[6] = pres1[6].replace("three days before session 56", "three days before session 57")
put(56, pt2)
put(57, pres1)
put(58, pres2)

g = wb["Grading structure"]
for r in range(2, g.max_row + 1):
    name = g.cell(r, 2).value
    if name == "Progress test 2":
        g.cell(r, 11).value = g.cell(r, 11).value.replace(
            "- taken in session 58, after all chapters have been taught (the last Chapter 10 session is session 55)",
            "- taken in session 56, right after the last Chapter 10 session (session 55) and before the project presentations")
    if name == "Assignment (group project)":
        v = g.cell(r, 12).value
        v = v.replace("due three days before session 56", "due three days before session 57")
        v = v.replace("final presentations in sessions 56–57", "final presentations in sessions 57–58")
        g.cell(r, 12).value = v

wb.save(sys.argv[2])
print("saved", sys.argv[2])
