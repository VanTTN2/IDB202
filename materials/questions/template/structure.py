import json, sys, collections
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter

d = json.load(open(sys.argv[1])); OUT = sys.argv[2]
R, U = d['rows'], d['units']
F = Font(name='Arial', size=10); B = Font(name='Arial', size=10, bold=True)
HF = PatternFill('solid', fgColor='D9E1F2'); thin = Side(style='thin', color='808080')
BOX = Border(left=thin, right=thin, top=thin, bottom=thin)
WRAP = Alignment(wrap_text=True, vertical='top')

def sheet(ws, header, rows, widths):
    ws.append(header)
    for r in rows: ws.append(r)
    for row in ws.iter_rows():
        for c in row:
            c.font = F; c.alignment = WRAP; c.border = BOX
    for c in ws[1]: c.font = B; c.fill = HF
    for i, w in enumerate(widths, 1): ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = 'A2'

PAGES = {}
exec(open(sys.argv[3]).read().split('# Course sessions')[0].split('# ---------------------------------------------------------------- pages (syllabus Schedule)')[1])
wb = Workbook()
ws = wb.active; ws.title = 'Sub-topics'
by = collections.defaultdict(list)
for r in R: by[r['unit']].append(r)
rows = []
for uid, ch, title, secs, sess, self_ in U:
    it = by.get(uid, [])
    pages = []
    for s in secs:
        if s in PAGES and PAGES[s] not in pages: pages.append(PAGES[s])
    rows.append([uid, ch, title, ', '.join('§' + s for s in secs) or '§5.1 (cursors), §5.2; Transact-SQL reference',
                 ', '.join(pages) or '183–197, 198–212', sess, 'Yes' if self_ else 'No', len(it),
                 sum(1 for x in it if x['mark'] == '0.5'), sum(1 for x in it if x['mark'] == '1')])
n = len(rows) + 1
rows.append(['Total', '', '', '', '', '', '', '=SUM(H2:H%d)' % n, '=SUM(I2:I%d)' % n, '=SUM(J2:J%d)' % n])
sheet(ws, ['UNIT (sub-topic ID)', 'Chapter', 'Sub-topic (syllabus wording)', 'DSC sections', 'DSC pages',
           'Syllabus sessions', 'Self-study', 'Questions', 'MARK 0.5 (Bloom 1–2)', 'MARK 1 (Bloom 3–4)'],
      rows, [12, 9, 60, 26, 20, 11, 10, 11, 13, 13])
for c in ws[ws.max_row]: c.font = B

ws2 = wb.create_sheet('Questions')
sheet(ws2, ['QN', 'Chapter', 'UNIT', 'ANSWER', 'MARK', 'Bloom level', 'CLO', 'Self-study', 'Shared-data group', 'REFERENCE'],
      [[r['qn'], r['chapter'], r['unit'], r['key'], float(r['mark']), r['level'], r['clo'], 'Yes' if r['self'] else '',
        r['group'], r['ref']] for r in R], [7, 9, 8, 9, 7, 12, 6, 11, 16, 70])
for row in ws2.iter_rows(min_row=2):
    row[4].number_format = '0.0'

ws3 = wb.create_sheet('Notes')
notes = [
 ['Item', 'Note'],
 ['Purpose', 'Draft structure of the IDB201 question bank (sub-topic IDs used in the UNIT field of IDB201_QB_MC_MOOC.docx). Replace it with the official "Cấu trúc kho đề" file if the department provides one; only the UNIT column would change.'],
 ['UNIT', 'Chapter number + sub-topic number. Sub-topics follow the syllabus Schedule (session topics and self-study readings). A question is placed by the first DSC section it cites that belongs to its own chapter. QN 452 (Chapter 8) cites DSC §15.3 only; it is placed in 8.4 because sessions 41 and 43 cover B+-tree height and the I/O cost of index lookups.'],
 ['MARK', 'Template rule: 0.5 = Bloom levels 1–2 (Remember, Understand); 1 = levels 3–4 (Apply, Analyze); 2 = levels 5–6 (none in this bank). Levels are taken from the final-exam bank.'],
 ['REFERENCE', 'PageNo_Tên GT. Page ranges are the reading ranges given for each DSC section in the syllabus Schedule (Student\'s materials and Student\'s task). Questions on SQL Server specifics cite the Transact-SQL reference (syllabus Materials, item 3, online), and some also cite a course session or Lab 5, as in the final-exam bank.'],
 ['QN', 'QN keeps the question number of the final-exam bank (QB 1–470), so the review forms and the bank refer to the same numbers. QB 58–63 are retired and not included.'],
 ['Shared-data groups', 'The template has no field for groups, so they are listed in the Questions sheet. Take at most one question from each group G1–G7 in one exam form.'],
]
sheet(ws3, notes[0], notes[1:], [20, 110])
wb.save(OUT)
