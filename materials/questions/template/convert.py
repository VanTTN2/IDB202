"""Convert the IDB201 MC_MOOC question bank to the university question template.

Inputs : template docx, MOOC bank docx, final bank docx (for level, references, groups).
Outputs: the bank in template format (docx) and a structure workbook (xlsx).
"""
import copy, json, re, sys, zipfile, shutil, os
from lxml import etree
from docx import Document

TPL, MOOC, FINAL, OUT, OUTX = sys.argv[1:6]
W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
def q(t): return '{%s}%s' % (W, t)

# ---------------------------------------------------------------- final bank metadata
fin = {}
cur = None
for p in Document(FINAL).paragraphs:
    t = p.text
    m = re.match(r'^(\d+)\. (.*)', t)
    if m and (cur is None or 'ans' in cur):
        cur = {'n': int(m.group(1)), 'stem': m.group(2)}
        fin[cur['n']] = cur
        continue
    if t.startswith('Answer:') and cur is not None:
        cur['ans'] = t
for n, r in fin.items():
    parts = [x.strip() for x in re.sub(r'\s+', ' ', r['ans']).split('·')]
    r['key'] = parts[0].split()[-1]
    r['chapter'] = int(parts[1].split()[-1])
    r['clo'] = parts[2]
    r['level'] = parts[3]
    r['kind'] = parts[4]
    r['self'] = 'Self-study' in parts
    g = [x for x in parts if x.startswith('Shared-data group')]
    r['group'] = g[0].split()[-1] if g else ''
    r['ref'] = parts[-1]

# ---------------------------------------------------------------- pages (syllabus Schedule)
PAGES = {}
def put(secs, pages):
    for s in secs: PAGES[s] = pages
put(['1.1', '1.2', '1.3'], '1–12'); put(['1.4', '1.5', '1.6', '1.7'], '13–23'); put(['1.8', '1.9'], '24–28')
put(['2.1', '2.2', '2.3', '2.4'], '37–46'); put(['2.5'], '47–57'); put(['2.6'], '48–57')
put(['3.1', '3.2', '3.3'], '65–78'); put(['3.4', '3.5', '3.6'], '79–90'); put(['3.7', '3.8'], '91–107'); put(['3.9'], '108–113')
put(['4.1', '4.2'], '125–142'); put(['4.3', '4.4', '4.5'], '143–163'); put(['4.6'], '164'); put(['4.7'], '165–172')
put(['5.1'], '183–197'); put(['5.2', '5.3'], '198–212'); put(['5.4'], '213–218'); put(['5.5'], '219–230')
put(['6.1', '6.2', '6.3'], '241–251'); put(['6.4', '6.5', '6.6'], '252–263'); put(['6.7'], '264–270'); put(['6.8'], '271–278')
put(['6.9'], '279–284'); put(['6.10', '6.11'], '285–291')
put(['7.1', '7.2'], '303–312'); put(['7.3'], '313–319'); put(['7.4'], '320–329'); put(['7.5'], '330–335')
put(['7.6'], '336–340'); put(['7.7'], '341'); put(['7.8'], '342'); put(['7.9'], '343–346')
put(['9.8'], '437–446'); put(['12.1'], '559–561'); put(['12.6'], '577–579')
put(['13.1', '13.2', '13.3'], '587–601'); put(['13.4'], '602–603'); put(['13.5'], '604–610'); put(['13.6'], '611–614')
put(['14.1', '14.2'], '623–633'); put(['14.3'], '634–649'); put(['14.4'], '650–657'); put(['14.5', '14.6', '14.7'], '658–664'); put(['14.8'], '665–669')
put(['15.1', '15.2', '15.3', '15.4'], '689–703'); put(['15.5'], '704–718'); put(['15.6'], '719–723'); put(['15.7'], '724–730')
put(['16.1', '16.2'], '743–756'); put(['16.3'], '757–765'); put(['16.4'], '766–777')
put(['17.1', '17.2', '17.3', '17.4'], '799–806'); put(['17.5', '17.6'], '807–818'); put(['17.7', '17.8', '17.9'], '819–827')
put(['18.1'], '835–848'); put(['18.2'], '849–852'); put(['18.3'], '853–856'); put(['18.4'], '857–860'); put(['18.5'], '861–865')
put(['18.7'], '869–871'); put(['18.8'], '872–879'); put(['18.9'], '880–882')
put(['19.1'], '907'); put(['19.2'], '908–911'); put(['19.3'], '912–921'); put(['19.4'], '922–925'); put(['19.5', '19.6'], '926–930')

# Course sessions that the bank cites directly, and the DSC sections the syllabus reads in them
SESSION_SEC = {'6': '2.6', '12': '3.9', '20': '5.2', '21': '5.2', '22': '5.3', '23': '5.1'}
TSQL_SESSIONS = {'20', '21', '22', '23'}

# ---------------------------------------------------------------- sub-topics (UNIT), from the syllabus Schedule
UNITS = [
 # id, chapter, title (syllabus wording), DSC sections, sessions, self-study
 ('1.1', 1, 'Database-system applications; purpose of database systems; view of data', ['1.1', '1.2', '1.3'], '1', False),
 ('1.2', 1, 'Database languages; database design; database engine; database and application architecture', ['1.4', '1.5', '1.6', '1.7'], '2', False),
 ('1.3', 1, 'Database users and administrators; history of database systems', ['1.8', '1.9'], '2', True),
 ('2.1', 2, 'Structure of relational databases; database schema; keys; schema diagrams', ['2.1', '2.2', '2.3', '2.4'], '4', False),
 ('2.2', 2, 'Relational query languages; the relational algebra, including division and aggregation as extended operators', ['2.5', '2.6'], '5–6', False),
 ('3.1', 3, 'Overview of SQL; SQL data definition; basic structure of SQL queries', ['3.1', '3.2', '3.3'], '9', False),
 ('3.2', 3, 'Additional basic operations; set operations; null values and three-valued logic', ['3.4', '3.5', '3.6'], '10', False),
 ('3.3', 3, 'Aggregate functions; nested subqueries', ['3.7', '3.8'], '11', False),
 ('3.4', 3, 'Modification of the database; translating SQL queries into relational algebra', ['3.9'], '12', False),
 ('4.1', 4, 'Join expressions; views', ['4.1', '4.2'], '15', False),
 ('4.2', 4, 'Transactions (preview); integrity constraints; SQL data types and schemas', ['4.3', '4.4', '4.5'], '16', False),
 ('4.3', 4, 'Authorization', ['4.7'], '16', True),
 ('4.4', 4, 'Index definition in SQL; recursive queries', ['4.6', '5.4'], '17', False),
 ('4.5', 4, 'Advanced aggregation features', ['5.5'], '17', True),
 ('5.1', 5, 'Accessing SQL from a programming language; SQL injection and parameterized queries in T-SQL', ['5.1'], '18', False),
 ('5.2', 5, 'Application security', ['9.8'], '18', True),
 ('5.3', 5, 'Functions and procedures: T-SQL batches, control flow, user-defined functions, stored procedures, TRY...CATCH, transactions inside a procedure', ['5.2'], '20–21', False),
 ('5.4', 5, 'Triggers', ['5.3'], '22', False),
 ('5.5', 5, 'Cursors in T-SQL; row-by-row versus set-based processing', [], '23', False),
 ('6.1', 6, 'Overview of the design process; the Entity-Relationship model; complex attributes', ['6.1', '6.2', '6.3'], '27', False),
 ('6.2', 6, 'Mapping cardinalities; primary key; removing redundant attributes in entity sets', ['6.4', '6.5', '6.6'], '28', False),
 ('6.3', 6, 'Reducing E-R diagrams to relational schemas', ['6.7'], '29', False),
 ('6.4', 6, 'Extended E-R features', ['6.8'], '29', True),
 ('6.5', 6, 'Entity-relationship design issues', ['6.9'], '30', False),
 ('6.6', 6, 'Alternative notations; other aspects of database design', ['6.10', '6.11'], '30', True),
 ('7.1', 7, 'Features of good relational designs; decomposition using functional dependencies', ['7.1', '7.2'], '32', False),
 ('7.2', 7, 'Normal forms: BCNF and 3NF', ['7.3'], '33', False),
 ('7.3', 7, 'Functional-dependency theory', ['7.4'], '34–35', False),
 ('7.4', 7, 'Algorithms for decomposition: BCNF decomposition and 3NF synthesis', ['7.5'], '36', False),
 ('7.5', 7, 'Decomposition using multivalued dependencies; atomic domains and first normal form', ['7.6', '7.8'], '37', False),
 ('7.6', 7, 'More normal forms; database-design process', ['7.7', '7.9'], '37', True),
 ('8.1', 8, 'Database storage architecture; file organization; organization of records in files; database buffer', ['13.1', '13.2', '13.3', '13.5'], '40', False),
 ('8.2', 8, 'Physical storage media; disk-block access; data-dictionary storage', ['12.1', '12.6', '13.4'], '40', True),
 ('8.3', 8, 'Indexing: basic concepts; ordered indices', ['14.1', '14.2'], '41', False),
 ('8.4', 8, 'B+-tree index files', ['14.3'], '41–42', False),
 ('8.5', 8, 'Hash indices; creation of indices', ['14.5', '14.7'], '42', False),
 ('8.6', 8, 'B+-tree extensions; multiple-key access; column-oriented storage; write-optimized index structures', ['14.4', '14.6', '13.6', '14.8'], '42', True),
 ('9.1', 9, 'Overview of query processing; measures of query cost; selection operation; sorting', ['15.1', '15.2', '15.3', '15.4'], '44', False),
 ('9.2', 9, 'Join operation', ['15.5'], '45', False),
 ('9.3', 9, 'Other operations; evaluation of expressions', ['15.6', '15.7'], '45', True),
 ('9.4', 9, 'Overview of query optimization; transformation of relational expressions; execution plans in SQL Server', ['16.1', '16.2'], '46', False),
 ('9.5', 9, 'Estimating statistics of expression results; choice of evaluation plans', ['16.3', '16.4'], '46', True),
 ('10.1', 10, 'Transaction concept; a simple transaction model; storage structure; transaction atomicity and durability; transactions as SQL statements', ['17.1', '17.2', '17.3', '17.4', '17.10'], '49', False),
 ('10.2', 10, 'Transaction isolation; serializability', ['17.5', '17.6'], '50', False),
 ('10.3', 10, 'Recoverable and cascadeless schedules; transaction isolation levels; implementation of isolation levels', ['17.7', '17.8', '17.9'], '51', False),
 ('10.4', 10, 'Concurrency control (DSC Ch. 18)', ['18.1', '18.2', '18.3', '18.4', '18.5', '18.7', '18.8', '18.9'], '51, 53', True),
 ('10.5', 10, 'Recovery system (DSC Ch. 19)', ['19.1', '19.2', '19.3', '19.4', '19.5', '19.6'], '55', True),
]
# Items whose cited section belongs to another chapter: placed by the syllabus session that practises them
OVERRIDE = {452: '8.4'}  # Ch. 8 item on I/O cost of a B+-tree lookup (sessions 41 and 43)
SEC2UNIT = {}
for u in UNITS:
    for s in u[3]:
        SEC2UNIT[s] = u[0]

def analyse(r):
    """Return (unit, reference) for one final-bank record; raises on anything unmapped."""
    ref = r['ref']
    assert ref.startswith('DSC '), ref
    body = ref[4:]
    secs, extra, tsql, unit = [], [], [], None
    for piece in re.split(r';\s*', body):
        piece = piece.strip()
        secs_here = re.findall(r'§(\d+\.\d+)', piece)
        sm = re.match(r'[Ss]ession (\d+)', piece)
        if secs_here:
            secs += secs_here
            if 'Lab 5' in piece: extra.append('Lab 5')
            if 'T-SQL reference' in piece:
                tsql.append(re.search(r'\(([^)]*)\)', piece).group(1))
        elif sm:
            n = sm.group(1)
            if n == '23':
                unit = '5.5'
            if n in TSQL_SESSIONS:
                secs.append(SESSION_SEC[n]); tsql.append('session %s' % n)
            elif n == '6':
                secs.append('2.6')
            else:
                extra.append('Session %s' % n)
        elif piece == 'Lab 5':
            extra.append('Lab 5')
        elif piece.startswith('T-SQL reference'):
            tsql.append(re.search(r'\(([^)]*)\)', piece).group(1))
        elif piece.startswith('dynamic SQL'):
            if 'T-SQL reference' in piece:
                tsql.append('dynamic SQL')
            else:
                secs.append('5.1')
        else:
            raise ValueError('unmapped reference: %r in QN %d' % (piece, r['n']))
    # sub-topic: the first cited DSC section that belongs to a unit of the item's chapter
    if unit is None:
        if any('cursors' in t for t in tsql):
            unit = '5.5'
        for s in secs:
            if unit: break
            u = SEC2UNIT.get(s)
            if u and int(u.split('.')[0]) == r['chapter']:
                unit = u
        if unit is None and tsql:
            unit = {'batches': '5.3', 'TRY…CATCH': '5.3', 'transactions': '5.3', 'dynamic SQL': '5.1'}[tsql[0]]
    if unit is None and r['n'] in OVERRIDE:
        unit = OVERRIDE[r['n']]
    if unit is None:
        raise ValueError('no unit for QN %d: %s' % (r['n'], ref))
    pages = []
    for s in secs:
        p = PAGES[s]
        if p not in pages: pages.append(p)
    parts = []
    if pages:
        parts.append(', '.join(pages) + '_Database System Concepts (7th ed.)')
    if tsql:
        topics = [t for t in tsql if not t.startswith('session')]
        label = 'Online_Transact-SQL reference (Microsoft)'
        if topics:
            label += ': ' + ', '.join(t.replace('…', '...') for t in topics)
        parts.append(label)
    parts += extra
    return unit, '; '.join(parts)

# ---------------------------------------------------------------- build the document
tpl_doc = etree.parse(zipfile.ZipFile(TPL).open('word/document.xml'))
tbody = tpl_doc.getroot().find(q('body'))
tpl_tbl = tbody.find(q('tbl'))
tpl_p = tbody.find(q('p'))
sect = tbody.find(q('sectPr'))
m_doc = etree.parse(zipfile.ZipFile(MOOC).open('word/document.xml'))
m_tbls = m_doc.getroot().find(q('body')).findall(q('tbl'))

def cell(tr, i): return tr.findall(q('tc'))[i]
def text(el): return ''.join(el.itertext())

def set_value(tc, value):
    """Keep the template's first paragraph and run formatting; write one value."""
    ps = tc.findall(q('p'))
    p0 = ps[0]
    for p in ps[1:]: tc.remove(p)
    runs = p0.findall(q('r'))
    if runs:
        r0 = runs[0]
        for r in runs[1:]: p0.remove(r)
        for t in r0.findall(q('t')): r0.remove(t)
    else:
        r0 = etree.SubElement(p0, q('r'))
    t = etree.SubElement(r0, q('t')); t.text = value
    if value != value.strip(): t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')

def put_paras(tc, src_tc):
    """Replace the template paragraphs of a cell with the source cell's paragraphs."""
    for p in tc.findall(q('p')): tc.remove(p)
    for p in src_tc.findall(q('p')):
        tc.append(copy.deepcopy(p))

for el in list(tbody): tbody.remove(el)
LABELS = ['QN=1', 'a.', 'b.', 'c.', 'd.', 'e.', 'f.', 'ANSWER:', 'MARK:', 'UNIT:', 'CLO:', 'MIX CHOICES:', 'CREATOR-REVIEWER:', 'EDITOR:', 'REFERENCE:']
assert [text(cell(tr, 0)) for tr in tpl_tbl.findall(q('tr'))] == LABELS
MARK = {'Remember': '0.5', 'Understand': '0.5', 'Apply': '1', 'Analyze': '1'}
rows_out = []
for mt in m_tbls:
    mr = mt.findall(q('tr'))
    qn = int(text(cell(mr[0], 0)).split('=')[1])
    r = fin[qn]
    assert 'RETIRED' not in r['ans']
    # cross-check the MOOC item against the final bank
    m_ans = text(cell(mr[7], 1)).strip(); m_lo = text(cell(mr[10], 1)).strip(); m_unit = text(cell(mr[9], 1)).strip()
    assert m_ans == r['key'], (qn, m_ans, r['key'])
    assert m_lo == r['clo'], (qn, m_lo, r['clo'])
    assert m_unit == 'Chapter%d' % r['chapter'], (qn, m_unit)
    assert re.sub(r'\s+', ' ', text(cell(mr[0], 1))).startswith(re.sub(r'\s+', ' ', r['stem'])[:40]), qn
    unit, ref = analyse(r)
    t = copy.deepcopy(tpl_tbl)
    for bm in list(t.iter(q('bookmarkStart'), q('bookmarkEnd'))):
        bm.getparent().remove(bm)
    tr = t.findall(q('tr'))
    set_value(cell(tr[0], 0), 'QN=%d' % qn)
    put_paras(cell(tr[0], 1), cell(mr[0], 1))
    for i in range(1, 5):
        put_paras(cell(tr[i], 1), cell(mr[i], 1))
    for i in (5, 6):
        tc = cell(tr[i], 1)
        assert text(tc) == '' and text(cell(mr[i], 1)) == ''
    vals = {7: r['key'], 8: MARK[r['level']], 9: unit, 10: r['clo'].replace('CLO', ''),
            11: 'YES', 12: 'VANTTN2', 13: 'VANTTN2', 14: ref}
    for i, v in vals.items():
        set_value(cell(tr[i], 1), v)
    tbody.append(t)
    tbody.append(copy.deepcopy(tpl_p))
    rows_out.append({'qn': qn, 'chapter': r['chapter'], 'unit': unit, 'mark': vals[8], 'level': r['level'],
                     'clo': vals[10], 'self': r['self'], 'group': r['group'], 'ref': ref, 'key': r['key']})
tbody.append(sect)

shutil.copy(TPL, OUT)
tmp = OUT + '.tmp'
with zipfile.ZipFile(TPL) as zin, zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as zout:
    for it in zin.infolist():
        data = zin.read(it.filename)
        if it.filename == 'word/document.xml':
            data = etree.tostring(tpl_doc, xml_declaration=True, encoding='UTF-8', standalone=True)
        zout.writestr(it, data)
os.replace(tmp, OUT)
json.dump({'rows': rows_out, 'units': UNITS}, open(OUTX, 'w'), ensure_ascii=False, indent=0)
print('items', len(rows_out))
