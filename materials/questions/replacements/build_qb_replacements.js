// Proposed replacements for QB 261 (proof of augmentation) and QB 374 (NP-completeness), removed topics (BM.09, item 2.1).
// Output: MOOC-template tables (QN=, a–f, ANSWER, MARK, UNIT, LO, MIX CHOICES) ready to paste into IDB201_QB_MC_MOOC.docx.
const path = require("path");
const { P, H1, H2, code, table, box, titleBlock, build } = require("../../docx_common");
const items = [
  { qn: 261, unit: "Chapter7", lo: "CLO5", level: "Analyze", ref: "DSC §7.4.1",
    stem: "R(A, B, C, D, E) with F = { A → C, BC → D, D → E }. Which sequence of Armstrong's rules derives AB → E from F?",
    opts: ["Augment A → C with B to get AB → BC, then use transitivity with BC → D and D → E",
           "Apply the union rule to A → C and BC → D, then decomposition to keep only AB → E",
           "Use reflexivity to get AB → B, then apply transitivity with D → E to get AB → E",
           "Augment D → E with AB to get ABD → ABE, then apply decomposition to get AB → E"], key: "c",
    why: "AB → BC (augmentation of A → C with B), BC → D gives AB → D, D → E gives AB → E. Union does not combine FDs with different left sides; AB → B and D → E do not chain; ABD → ABE has D on the left, so AB → E does not follow from it." },
  { qn: 374, unit: "Chapter10", lo: "CLO7", level: "Understand", ref: "DSC §17.6",
    stem: "Two consecutive operations of different transactions appear in a schedule S. Which pair can be swapped without changing the conflict equivalence of S, as is done when testing conflict serializability?",
    opts: ["r1(Q) r2(Q): two reads of the same item Q", "r1(Q) w2(Q): a read and then a write of Q", "w1(Q) r2(Q): a write and then a read of Q", "w1(Q) w2(Q): two writes of the same item Q"], key: "d",
    why: "Two operations conflict when they come from different transactions, access the same item and at least one is a write. Two reads never conflict, so their order does not matter; the other three pairs conflict and cannot be swapped (DSC §17.6). The item replaces the NP-completeness argument of the old QB 374 and does not overlap QB 369, 372, 373, 383, 466 or 470." },
];
const kids = [...titleBlock("Question bank: proposed replacements for QB 261 and QB 374",
  "Removed topics: proofs and NP-completeness (review form BM.09, item 2.1)",
  [["Date", "24 Nov 2026"], ["Use", "Replace QN=261 and QN=374 in IDB201_QB_MC_MOOC.docx and in IDB201_Final_Exam_Question_Bank.docx; the key keeps the letter of the old item (C for 261, D for 374), so the A–D balance of the bank does not change"],
   ["Checked", "One correct option each; options of similar length; no overlap with Progress test 1–2 or other bank items"]])];
for (const q of items) {
  // the first option in the source is the key; put it at the position of the old item's key, so the A–D balance of the bank stays the same
  const k = "abcd".indexOf(q.key), o = q.opts.slice(1); o.splice(k, 0, q.opts[0]); q.opts = o;
  kids.push(H2(`QN=${q.qn} (replacement) – ${q.unit}, ${q.lo}, ${q.level}, ${q.ref}`));
  kids.push(...table([1, 5], null, [
    [`QN=${q.qn}`, q.stem], ["a.", q.opts[0]], ["b.", q.opts[1]], ["c.", q.opts[2]], ["d.", q.opts[3]], ["e.", ""], ["f.", ""],
    ["ANSWER:", q.key.toUpperCase()], ["MARK:", "0.2"], ["UNIT:", q.unit], ["LO:", q.lo], ["MIX CHOICES:", "Yes"]]));
  kids.push(...box("Why (lecturer note)", [q.why]));
}
build(path.join(__dirname, "out", "IDB201_QB_Replacements_261_374.docx"), kids, { title: "IDB201 QB replacements" });
