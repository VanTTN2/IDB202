// Chapter 6 – Database design using the E-R model (sessions 27–30)
const L = require("../lib");
const { HEX, X0, CW } = L;
const src = (x) => `Source: DSC 7th ed., ${x}`;
const drawn = (x) => `Diagram drawn for IDB201 after DSC 7th ed., ${x} (notation of DSC)`;

// E-R drawing helpers (labels >= 18 pt)
function ent(s, name, x, y, w, attrs = [], o = {}) {
  const h = 0.5 + attrs.length * 0.32 + (attrs.length ? 0.1 : 0);
  if (o.weak) s.addShape("rect", { x: x - 0.07, y: y - 0.07, w: w + 0.14, h: h + 0.14, fill: { color: HEX.white }, line: { color: HEX.navy, width: 1.5 } });
  s.addShape("rect", { x, y, w, h, fill: { color: HEX.white }, line: { color: HEX.navy, width: 1.5 } });
  s.addShape("rect", { x, y, w, h: 0.5, fill: { color: HEX.pale }, line: { color: HEX.navy, width: 1.5 } });
  s.addText(name, { x, y, w, h: 0.5, fontSize: 18, bold: true, color: HEX.navy, align: "center", valign: "middle", isTextBox: true, margin: 0 });
  if (attrs.length) s.addText(attrs.map((a, i) => ({ text: a.replace(/^[_~]/, ""), options: { underline: a.startsWith("_") ? { style: "sng" } : (a.startsWith("~") ? { style: "dash" } : undefined), breakLine: i < attrs.length - 1 } })),
    { x: x + 0.1, y: y + 0.55, w: w - 0.2, h: attrs.length * 0.32, fontSize: 18, color: HEX.ink, valign: "top", isTextBox: true, margin: 0, lineSpacing: 23 });
  return { x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
}
function rel(s, name, x, y, w = 1.9, h = 0.95, o = {}) {
  if (o.weak) s.addShape("diamond", { x: x - 0.12, y: y - 0.08, w: w + 0.24, h: h + 0.16, fill: { color: HEX.white }, line: { color: HEX.navy, width: 1.5 } });
  s.addShape("diamond", { x, y, w, h, fill: { color: HEX.paleOrange }, line: { color: HEX.navy, width: 1.5 } });
  s.addText(name, { x, y, w, h, fontSize: 18, bold: true, color: HEX.navy, align: "center", valign: "middle", isTextBox: true, margin: 0 });
  return { x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
}
function link(s, x1, y1, x2, y2, o = {}) {
  if (o.double) {
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), ox = -dy / len * 0.05, oy = dx / len * 0.05;
    L.arrow(s, x1 + ox, y1 + oy, x2 + ox, y2 + oy, { noHead: true, width: 1.5 });
    L.arrow(s, x1 - ox, y1 - oy, x2 - ox, y2 - oy, { noHead: !o.head, width: 1.5 });
  } else L.arrow(s, x1, y1, x2, y2, { noHead: !o.head, width: 1.75 });
  if (o.label) L.text(s, o.label, o.lx, o.ly, 1.2, 0.4, { fontSize: 18, color: HEX.orange, bold: true, align: "center" });
}

module.exports = {
  n: 6,
  title: "Database design using the E-R model",
  textbook: "DSC Ch. 6, §6.1–6.7 and §6.9, pp. 241–284; self-study §6.8, §6.10–6.11, pp. 271–278, 285–291.",
  clos: ["CLO2"],
  objectives: [
    "Model requirements with entity sets, relationship sets and attributes, including complex attributes",
    "Choose mapping cardinalities and participation constraints from the wording of requirements",
    "Recognize weak entity sets and their identifying relationships",
    "Reduce an E-R diagram to relation schemas with keys and foreign keys",
    "Compare design alternatives and name the rules an E-R diagram cannot express",
  ],
  roadNote: "Session 31: Lab 4 (E-R design and implementation) · Session 39: project milestone 1 (design review)",
  sessions: [
    { n: 27, name: "E-R basics", sum: "6.1 design process; 6.2 entity and relationship sets; 6.3 complex attributes",
      slides: [
        { k: "draw", h: "6.1 The design process", src: src("§6.1"), draw: (s) => {
          [["Requirements", "What data and operations do users need?"], ["Conceptual", "E-R diagram: this chapter"], ["Logical", "Relation schemas: §6.7, Ch. 7"], ["Physical", "Files and indexes: Ch. 8"]].forEach((c, i) => {
            const x = X0 + i * 3.1;
            L.node(s, c[0], x, 1.8, 2.7, 1.0, { fill: i === 1 ? HEX.paleOrange : HEX.white });
            L.text(s, c[1], x, 3.0, 2.7, 1.3, { fontSize: 20, align: "center" });
            if (i < 3) L.arrow(s, x + 2.7, 2.3, x + 3.1, 2.3, { color: HEX.orange });
          });
          L.autoCard(s, X0, 4.6, CW, 1.9, null, "Design moves from what the users need to how the data is stored. Each step can send the designer back to an earlier one.", "dp", { fill: HEX.pale });
        } },
        { k: "cards", h: "6.1 Two pitfalls of design", src: src("§6.1.2"), cards: [
          ["Redundancy", "The same fact stored twice; the copies drift apart (e.g. a course title stored with every section)"],
          ["Incompleteness", "Some aspect of the enterprise cannot be represented (e.g. a course with no section yet)"],
          ["Goal", "Represent every fact once, and every needed fact somewhere", HEX.paleOrange]] },
        { k: "bul", h: "6.2 Entities and entity sets", src: src("§6.2.1"), items: [
          "Entity: a thing distinguishable from all other objects, e.g. one instructor",
          "Entity set: entities of the same type with the same attributes, e.g. instructor",
          "Each entity is described by attribute values",
          "Entity sets need not be disjoint: a person can be in instructor and student"],
          right: { draw: (s) => { ent(s, "instructor", 8.2, 1.7, 3.2, ["_ID", "name", "salary"]); L.text(s, "Rectangle: entity set\nUnderline: primary key", 7.6, 3.9, 4.6, 1.2, { fontSize: 20, color: HEX.grey, align: "center" }); } } },
        { k: "draw", h: "6.2 Relationship sets", src: drawn("§6.2.2"), draw: (s) => {
          const i = ent(s, "instructor", 0.7, 1.7, 2.8, ["_ID", "name"]);
          const r = rel(s, "advisor", 4.6, 1.95, 2.2, 1.0);
          const st = ent(s, "student", 7.9, 1.7, 2.8, ["_ID", "name"]);
          link(s, 3.5, 2.45, 4.6, 2.45); link(s, 6.8, 2.45, 7.9, 2.45);
          L.node(s, "date", 4.9, 3.6, 1.6, 0.6, { size: 18, fill: HEX.white });
          L.arrow(s, 5.7, 2.95, 5.7, 3.6, { noHead: true, dash: "dash", width: 1.5 });
          L.autoCard(s, X0, 4.5, CW, 2.0, null, ["Relationship: an association among entities; relationship set: a set of them (diamond)", "Descriptive attribute: date on which the instructor became the advisor", "Degree: number of entity sets involved; binary is the most common"], "relset", { fill: HEX.pale, size: 22 });
        } },
        { k: "draw", h: "6.2 Roles in a recursive relationship", src: drawn("§6.2.2"), draw: (s) => {
          ent(s, "course", 1.0, 2.2, 3.0, ["_course_id", "title", "credits"]);
          rel(s, "prereq", 6.0, 2.5, 2.2, 1.0);
          L.arrow(s, 4.0, 2.7, 6.2, 2.85, { noHead: true, width: 1.75 }); L.arrow(s, 4.0, 3.4, 6.2, 3.15, { noHead: true, width: 1.75 });
          L.text(s, "course_id", 4.3, 2.15, 1.8, 0.4, { fontSize: 18, color: HEX.orange, bold: true });
          L.text(s, "prereq_id", 4.3, 3.35, 1.8, 0.4, { fontSize: 18, color: HEX.orange, bold: true });
          L.autoCard(s, 8.8, 1.8, 3.9, 3.4, "Roles", "When the same entity set appears twice, each line is labelled with the role it plays: the course and its prerequisite.", "roles", { fill: HEX.pale, size: 22 });
          L.text(s, "The data of prereq is the graph of Chapter 4.", 1.0, 5.4, 11.0, 0.6, { fontSize: 20, color: HEX.grey });
        } },
        { k: "cards", h: "E-R notation used in this course", src: src("§6.2–6.5 (notation of DSC)"), cards: [
          ["Rectangle", "Entity set; attributes inside; primary key underlined"],
          ["Diamond", "Relationship set; descriptive attributes attached"],
          ["Arrow", "“At most one” on that side (§6.4)"],
          ["Double line or shape", "Total participation; weak entity set and its identifying relationship (§6.5)"]] },
        { k: "draw", h: "E-R diagram of the university (simplified)", src: drawn("§6.2–6.5"), draw: (s) => {
          ent(s, "instructor", 0.5, 1.4, 2.4, ["_ID", "name", "salary"]);
          ent(s, "student", 10.3, 1.4, 2.4, ["_ID", "name", "tot_cred"]);
          ent(s, "department", 0.5, 4.9, 2.4, ["_dept_name", "building"]);
          ent(s, "course", 10.8, 4.9, 1.9, ["_course_id", "title"]);
          ent(s, "section", 5.4, 3.35, 2.5, ["~sec_id", "~semester", "~year"], { weak: true });
          rel(s, "advisor", 5.6, 1.45, 2.1, 0.9);
          rel(s, "teaches", 3.0, 3.4, 1.9, 0.85); rel(s, "takes", 8.5, 3.4, 1.7, 0.85);
          rel(s, "inst_dept", 0.75, 3.45, 1.9, 0.8);
          rel(s, "sec_course", 8.4, 5.2, 1.9, 0.85, { weak: true });
          link(s, 5.6, 1.9, 2.9, 1.9, { head: true }); link(s, 7.7, 1.9, 10.3, 1.9, { double: true });
          link(s, 2.3, 2.96, 3.5, 3.6); link(s, 4.9, 3.82, 5.33, 3.95);
          link(s, 7.97, 3.95, 8.5, 3.82); link(s, 10.2, 3.82, 11.0, 2.96);
          link(s, 1.7, 2.96, 1.7, 3.45); link(s, 1.7, 4.25, 1.7, 4.9, { head: true });
          link(s, 6.65, 4.98, 8.55, 5.62, { double: true }); link(s, 10.3, 5.62, 10.8, 5.55, { head: true });
          L.text(s, "Attribute grade on takes, and the departments of student and course, are omitted", 2.9, 6.3, 7.6, 0.45, { fontSize: 18, color: HEX.grey, align: "center" });
        } },
        { k: "table", h: "6.3 Complex attributes", src: src("§6.3"), size: 20, rowH: 0.72, colW: [3.0, 4.6, 4.53], rows: [
          ["Kind", "Meaning", "Example"],
          ["Composite", "Divided into subparts", "name: first_name, last_name"],
          ["Multivalued", "A set of values for one entity", "{phone_number} of an instructor"],
          ["Derived", "Computed, not stored", "age() from date_of_birth"],
          ["Domain", "The permitted values", "credits: positive integers"],
          ["Null", "Missing or not applicable", "apartment_number of a house"]] },
        { k: "draw", h: "6.3 Complex attributes in a diagram", src: drawn("§6.3"), draw: (s) => {
          ent(s, "instructor", 1.0, 1.5, 4.2, ["_ID", "name", "   first_name", "   last_name", "address", "   street, city", "{phone_number}", "date_of_birth", "age ( )"]);
          L.autoCard(s, 6.0, 1.5, 6.7, 4.9, "How to read it", ["Indented: subparts of a composite attribute", "Braces { }: a multivalued attribute", "( ): a derived attribute, computed from date_of_birth", "§6.7 shows how each one becomes relational"], "cattr", { fill: HEX.pale, size: 22 });
        } },
      ] },
    { n: 28, name: "Constraints and keys", sum: "6.4 cardinalities and participation; 6.5 keys, weak entity sets; 6.6 redundancy",
      slides: [
        { k: "draw", h: "6.4 Mapping cardinalities", src: drawn("§6.4"), draw: (s) => {
          const kinds = [["one-to-one", true, true], ["one-to-many", true, false], ["many-to-one", false, true], ["many-to-many", false, false]];
          kinds.forEach(([t, a, b], i) => {
            const y = 1.45 + i * 1.28;
            L.node(s, "A", 0.8, y, 1.4, 0.8, { size: 20 });
            rel(s, "R", 3.3, y - 0.05, 1.4, 0.9);
            L.node(s, "B", 5.8, y, 1.4, 0.8, { size: 20 });
            L.arrow(s, 3.3, y + 0.4, 2.2, y + 0.4, { noHead: !a, width: 1.75 });
            L.arrow(s, 4.7, y + 0.4, 5.8, y + 0.4, { noHead: !b, width: 1.75 });
            L.text(s, t, 7.6, y, 2.6, 0.8, { fontSize: 22, bold: true, color: HEX.navy, valign: "middle" });
          });
          L.autoCard(s, 10.2, 1.45, 2.5, 4.7, "Arrow", "An arrow towards an entity set means “at most one” of it.", "card", { fill: HEX.paleOrange, size: 20 });
        } },
        { k: "draw", h: "6.4 Reading cardinalities: advisor", src: drawn("§6.4"), draw: (s) => {
          ent(s, "instructor", 0.8, 1.7, 2.8, ["_ID", "name"]);
          rel(s, "advisor", 4.7, 1.95, 2.2, 1.0);
          ent(s, "student", 8.0, 1.7, 2.8, ["_ID", "name"]);
          link(s, 4.7, 2.45, 3.6, 2.45, { head: true }); link(s, 6.9, 2.45, 8.0, 2.45);
          L.autoCard(s, X0, 3.9, CW, 2.6, null, ["The arrow points to instructor: each student has at most one advisor", "The plain line to student: an instructor advises any number of students", "So advisor is one-to-many from instructor to student"], "adv", { fill: HEX.pale, size: 22 });
        } },
        { k: "draw", h: "6.4 Participation", src: drawn("§6.4"), draw: (s) => {
          ent(s, "instructor", 0.8, 1.7, 2.8, ["_ID"]);
          rel(s, "advisor", 4.7, 1.8, 2.2, 1.0);
          ent(s, "student", 8.0, 1.7, 2.8, ["_ID"]);
          link(s, 4.7, 2.3, 3.6, 2.3, { head: true }); link(s, 6.9, 2.3, 8.0, 2.3, { double: true });
          L.text(s, "double line", 6.7, 2.75, 1.8, 0.4, { fontSize: 18, color: HEX.orange, bold: true });
          L.autoCard(s, X0, 3.6, 5.9, 2.9, "Total", "Every student takes part in at least one advisor relationship.", "tot", { fill: HEX.paleOrange });
          L.autoCard(s, X0 + 6.15, 3.6, 5.95, 2.9, "Partial", "Some instructors advise nobody: a single line.", "par", { fill: HEX.pale });
        } },
        { k: "draw", h: "6.4 Cardinality limits", src: drawn("§6.4"), draw: (s) => {
          ent(s, "instructor", 0.8, 1.7, 2.8, ["_ID"]);
          rel(s, "advisor", 4.7, 1.8, 2.2, 1.0);
          ent(s, "student", 8.0, 1.7, 2.8, ["_ID"]);
          link(s, 3.6, 2.3, 4.7, 2.3); link(s, 6.9, 2.3, 8.0, 2.3);
          L.text(s, "0..*", 3.7, 1.75, 1.0, 0.45, { fontSize: 20, color: HEX.orange, bold: true });
          L.text(s, "1..1", 7.0, 1.75, 1.0, 0.45, { fontSize: 20, color: HEX.orange, bold: true });
          L.autoCard(s, X0, 3.6, CW, 2.9, "l..h on a line", ["l: minimum, h: maximum number of relationships per entity; * means no limit", "1..1 on the student side: each student has exactly one advisor", "0..* on the instructor side: zero or more students"], "lim", { fill: HEX.pale, size: 22 });
        } },
        { k: "table", h: "6.5 Primary keys of relationship sets", src: src("§6.5.2"), size: 22, rowH: 0.85, colW: [4.0, 8.13], rows: [
          ["Mapping cardinality", "Primary key of the relationship set"],
          ["Many-to-many", "Union of the primary keys of both entity sets"],
          ["One-to-many / many-to-one", "Primary key of the entity set on the “many” side"],
          ["One-to-one", "Primary key of either entity set"],
          ["Non-binary, no constraints", "Union of the primary keys of all entity sets"]] },
        { k: "draw", h: "6.5 Weak entity sets", src: drawn("§6.5.3"), draw: (s) => {
          ent(s, "course", 0.8, 1.6, 2.8, ["_course_id", "title"]);
          rel(s, "sec_course", 4.5, 1.75, 2.3, 1.0, { weak: true });
          ent(s, "section", 8.0, 1.6, 2.8, ["~sec_id", "~semester", "~year"], { weak: true });
          link(s, 4.5, 2.25, 3.6, 2.25, { head: true }); link(s, 6.8, 2.25, 7.93, 2.25, { double: true });
          L.autoCard(s, X0, 3.8, CW, 2.7, null, ["A section exists only for a course: course is its identifying entity set", "Discriminator (dashed underline): sec_id, semester, year", "Primary key of section: course_id + discriminator"], "weak", { fill: HEX.pale, size: 22 });
        } },
        { k: "cards", h: "6.5 Weak entity sets: the rules", src: src("§6.5.3"), cards: [
          ["Identifying relationship", "Many-to-one from the weak to the identifying entity set (double diamond)"],
          ["Total participation", "Every weak entity is linked to its identifying entity (double line)"],
          ["Alternative", "Give section its own ID attribute: then it is a strong entity set", HEX.paleOrange]] },
        { k: "cards", h: "6.6 Removing redundant attributes", src: src("§6.6"), cards: [
          ["The case", "dept_name in instructor repeats what the relationship inst_dept says"],
          ["The rule", "Remove dept_name from instructor in the E-R model"],
          ["Later", "It comes back in the relational schema when inst_dept is reduced (§6.7)", HEX.paleOrange]],
          note: "Each fact should be represented exactly once in the E-R model." },
        { k: "quick", h: "Quick check: session 28", src: "Questions written for IDB201 on DSC 7th ed., §6.4–6.5",
          qs: ["“Each course belongs to exactly one department.” Where is the arrow, and which participation is total?",
               "What is the primary key of takes, a many-to-many relationship set between student and section?",
               "Why is payment(payment_number, date, amount) of a loan usually a weak entity set?"],
          ans: "1 arrow towards department, course participates totally; 2 student ID plus the key of section (course_id, sec_id, semester, year); 3 payment_number is unique only within one loan." },
      ] },
    { n: 29, name: "Reduction", sum: "6.7 E-R diagrams to relation schemas; self-study §6.8",
      slides: [
        { k: "table", h: "6.7 Reduction rules (1/2)", src: src("§6.7"), size: 20, rowH: 1.0, colW: [3.4, 8.73], rows: [
          ["E-R construct", "Relation schema"],
          ["Strong entity set", "One relation with the same simple attributes and primary key"],
          ["Composite attribute", "One attribute per subpart: street, city for address"],
          ["Multivalued attribute", "A separate relation: key of E + the attribute, all in the primary key, e.g. instructor_phone(ID, phone_number)"]] },
        { k: "table", h: "6.7 Reduction rules (2/2)", src: src("§6.7"), size: 20, rowH: 1.0, colW: [3.4, 8.73], rows: [
          ["E-R construct", "Relation schema"],
          ["Derived attribute", "Not stored; computed in a view or query"],
          ["Weak entity set", "Its attributes + key of the identifying set; foreign key to it, e.g. section(course_id, sec_id, semester, year, …)"],
          ["Relationship set", "Keys of the participating entity sets + descriptive attributes; a foreign key to each"]] },
        { k: "draw", h: "From diagram to schemas: advisor", src: drawn("§6.7"), draw: (s) => {
          ent(s, "instructor", 0.7, 1.6, 2.4, ["_ID", "name"]);
          rel(s, "advisor", 3.6, 1.75, 1.9, 0.9);
          ent(s, "student", 6.0, 1.6, 2.4, ["_ID", "name"]);
          link(s, 3.6, 2.2, 3.1, 2.2, { head: true }); link(s, 5.5, 2.2, 6.0, 2.2);
          L.arrow(s, 4.55, 3.4, 4.55, 4.0, { color: HEX.orange, width: 3 });
          L.code(s, "instructor(ID, name)\nstudent(ID, name)\nadvisor(s_ID, i_ID)\n  primary key s_ID\n  s_ID -> student, i_ID -> instructor", 0.7, 4.1, 7.7, 2.4, { size: 20 });
          L.autoCard(s, 8.9, 1.6, 3.8, 4.9, "Why s_ID only?", "advisor is many-to-one from student to instructor, so the “many” side, student, gives the key.", "adv", { fill: HEX.paleOrange, size: 22 });
        } },
        { k: "cards", h: "6.7 Redundant and combined schemas", src: src("§6.7.4–6.7.5"), cards: [
          ["Redundant", "The schema of an identifying relationship (sec_course) repeats the weak entity's relation: drop it"],
          ["Combine", "A many-to-one relationship from A to B with total participation of A can join A's schema"],
          ["Example", "inst_dept joins instructor: instructor(ID, name, dept_name, salary), dept_name → department", HEX.paleOrange],
          ["Partial participation", "Combining still works; unmatched entities get null in the foreign key"]] },
        { k: "code", h: "Implementing the reduction in SQL Server", src: src("§6.7; SQL Server CREATE TABLE"), codeW: 8.2, code:
"create table instructor (\n  ID        varchar(5) primary key,\n  name      varchar(20) not null,\n  dept_name varchar(20) references department,\n  salary    numeric(8,2));\n\ncreate table instructor_phone (\n  ID           varchar(5) references instructor,\n  phone_number varchar(15),\n  primary key (ID, phone_number));\n\ncreate table advisor (\n  s_ID varchar(5) primary key references student,\n  i_ID varchar(5) not null references instructor);",
          items: ["Multivalued attribute: own relation", "Many-to-one: key on the many side"] },
        { k: "cards", h: "Choices in the implementation", src: src("§6.7; Lab 4"), cards: [
          ["Key of advisor", "s_ID only: each student has at most one advisor"],
          ["not null on i_ID", "Every advisor row names an instructor"],
          ["Total participation", "A foreign key cannot force every student to have an advisor: use a trigger or a combined schema", HEX.paleOrange]],
          note: "Lab 4 (session 31) asks for this kind of design and implementation on a clinic database." },
        { k: "draw", h: "Self-study: §6.8 specialization", src: "Self-study; diagram drawn for IDB201 after DSC 7th ed., §6.8", draw: (s) => {
          ent(s, "person", 4.9, 1.45, 3.0, ["_ID", "name"]);
          ent(s, "employee", 1.8, 4.3, 3.0, ["salary"]);
          ent(s, "student", 8.0, 4.3, 3.0, ["tot_cred"]);
          L.arrow(s, 3.3, 4.3, 5.6, 2.8, { width: 2 }); L.arrow(s, 9.5, 4.3, 7.2, 2.8, { width: 2 });
          L.text(s, "ISA", 6.0, 3.3, 0.9, 0.45, { fontSize: 20, color: HEX.orange, bold: true, align: "center" }); L.text(s, "overlapping: a person can be both", 8.4, 2.4, 4.3, 0.8, { fontSize: 18, color: HEX.orange, bold: true });
          L.text(s, "Lower-level entity sets inherit ID and name", 1.8, 6.0, 9.2, 0.5, { fontSize: 20, color: HEX.grey, align: "center" });
        } },
        { k: "cards", h: "Self-study: §6.8 extended E-R features", src: "Self-study source: DSC 7th ed., §6.8, pp. 271–278", cards: [
          ["Generalization", "The same hierarchy found bottom-up from common attributes"],
          ["Constraints", "Disjoint or overlapping; total or partial"],
          ["Aggregation", "Treats a relationship set as an entity set, so it can take part in another relationship"],
          ["Reduction", "One relation per level, or only lower-level relations if total. Assessed in PT2 and the final exam", HEX.paleOrange]] },
        { k: "quick", h: "Quick check: session 29", src: "Questions written for IDB201 on DSC 7th ed., §6.7",
          qs: ["How many relation schemas does the reduction give for student, section and the many-to-many takes?",
               "Which schema of the university diagram is redundant and can be dropped?",
               "A student can have several e-mail addresses. Which relation do you add?"],
          ans: "1 three (student, section, takes); 2 sec_course; 3 student_email(ID, email) with primary key (ID, email) and a foreign key to student." },
      ] },
    { n: 30, name: "Design issues", sum: "6.9 design alternatives; limits of the E-R model; CQ6.1–CQ6.3",
      slides: [
        { k: "cards", h: "6.9 Entity set or attribute?", src: src("§6.9.1"), cards: [
          ["Attribute", "phone_number as an attribute of instructor: enough if only the number matters"],
          ["Entity set", "phone as an entity set with number, location and type: needed when we keep facts about the phone"],
          ["Mistake to avoid", "Using the key of another entity set as an attribute instead of a relationship", HEX.paleOrange]] },
        { k: "cards", h: "6.9 Entity set or relationship set?", src: src("§6.9.2"), cards: [
          ["Relationship set", "takes: an action between a student and a section"],
          ["Entity set", "registration, when the action has its own identity and attributes (date, fee, status)"],
          ["Guideline", "Use a relationship set to describe an action that occurs between entities", HEX.paleOrange]] },
        { k: "draw", h: "6.9 Binary or n-ary?", src: drawn("§6.9.3"), draw: (s) => {
          L.node(s, "instructor", 0.6, 1.6, 2.2, 0.75, { size: 18 }); L.node(s, "student", 0.6, 3.1, 2.2, 0.75, { size: 18 }); L.node(s, "project", 0.6, 4.6, 2.2, 0.75, { size: 18 });
          rel(s, "proj_guide", 3.6, 2.95, 2.2, 1.05);
          L.arrow(s, 2.8, 1.97, 3.9, 3.15, { noHead: true }); L.arrow(s, 2.8, 3.47, 3.6, 3.47, { noHead: true }); L.arrow(s, 2.8, 4.97, 3.9, 3.8, { noHead: true });
          L.text(s, "one ternary relationship", 0.6, 5.6, 5.2, 0.45, { fontSize: 18, color: HEX.grey, align: "center" });
          L.text(s, "≠ ?", 6.2, 3.1, 1.0, 0.7, { fontSize: 32, bold: true, color: HEX.orange, align: "center" });
          L.node(s, "inst_stud", 7.6, 1.6, 2.3, 0.75, { size: 18, fill: HEX.paleOrange });
          L.node(s, "stud_proj", 7.6, 3.1, 2.3, 0.75, { size: 18, fill: HEX.paleOrange });
          L.node(s, "inst_proj", 7.6, 4.6, 2.3, 0.75, { size: 18, fill: HEX.paleOrange });
          L.text(s, "three binary relationships", 7.0, 5.6, 3.5, 0.45, { fontSize: 18, color: HEX.grey, align: "center" });
          L.autoCard(s, 10.3, 1.6, 2.4, 3.75, "CQ6.2", "Do the three binary ones keep the same information?", "nary", { fill: HEX.pale, size: 20 });
        } },
        { k: "cards", h: "6.9 Where do attributes go?", src: src("§6.9.4"), cards: [
          ["One-to-many", "An attribute of the relationship can move to the entity set on the “many” side"],
          ["Many-to-many", "It must stay on the relationship set: grade of takes (CQ6.1)"],
          ["Check", "Ask which combination of entities the value belongs to", HEX.paleOrange]] },
        { k: "bul", h: "Limits of the E-R model", src: src("§6.9, §6.11; synthesis for IDB201"), items: [
          "The diagram records keys, cardinalities and participation",
          "Many business rules have no notation: aggregate limits, conditions over time, rules across attributes",
          "Such rules are written beside the diagram and enforced by checks, triggers or code (Ch. 4–5)",
          "Normalization (Chapter 7) gives a formal test the E-R model does not"],
          right: { card: ["Example", "“A student may take at most 30 credits per semester” cannot be drawn: it needs a trigger or a procedure."] } },
        { k: "draw", h: "Self-study: §6.10 alternative notations", src: "Self-study; diagram drawn for IDB201 after DSC 7th ed., §6.10", draw: (s) => {
          const names = ["Chen (DSC)", "Crow's foot", "UML class diagram"];
          names.forEach((n, i) => {
            const y = 1.55 + i * 1.5;
            L.text(s, n, 0.6, y, 3.0, 0.85, { bold: true, color: HEX.navy, valign: "middle", fontSize: 22 });
            L.node(s, "instructor", 3.8, y, 2.2, 0.85, { size: 18 });
            L.node(s, "student", 10.0, y, 2.2, 0.85, { size: 18 });
            const my = y + 0.42;
            if (i === 0) { rel(s, "advisor", 7.0, y - 0.05, 2.0, 0.95); L.arrow(s, 7.0, my, 6.0, my, { width: 1.75 }); L.arrow(s, 9.0, my, 10.0, my, { noHead: true, width: 1.75 }); }
            if (i === 1) {
              L.arrow(s, 6.0, my, 10.0, my, { noHead: true, width: 1.75 });
              L.arrow(s, 6.25, my - 0.2, 6.25, my + 0.2, { noHead: true, width: 1.75 }); L.arrow(s, 6.4, my - 0.2, 6.4, my + 0.2, { noHead: true, width: 1.75 });
              L.arrow(s, 9.6, my, 10.0, my - 0.22, { noHead: true, width: 1.75 }); L.arrow(s, 9.6, my, 10.0, my + 0.22, { noHead: true, width: 1.75 });
              L.text(s, "one", 6.1, my + 0.25, 0.8, 0.4, { fontSize: 18, color: HEX.orange }); L.text(s, "many", 9.3, my + 0.25, 0.9, 0.4, { fontSize: 18, color: HEX.orange });
            }
            if (i === 2) {
              L.arrow(s, 6.0, my, 10.0, my, { noHead: true, width: 1.75 });
              L.text(s, "0..1", 6.1, my - 0.45, 0.9, 0.4, { fontSize: 18, color: HEX.orange, bold: true }); L.text(s, "0..*", 9.1, my - 0.45, 0.9, 0.4, { fontSize: 18, color: HEX.orange, bold: true });
            }
          });
          L.text(s, "Same meaning, different drawings: read the legend of every diagram. Assessed in PT2 and the final exam.", 0.6, 6.05, 12.0, 0.6, { fontSize: 20, color: HEX.grey });
        } },
        { k: "cq", id: "CQ6.1", look: "Where to look: DSC 7th ed., §6.2 (descriptive attributes), §6.9", prompts: [
          "How many grades does one student have? One section?",
          "Which pair of entities does one grade belong to?",
          "Relate your answer to the placement of relationship attributes (§6.9)"] },
        { k: "cq", id: "CQ6.2", look: "Where to look: DSC 7th ed., §6.9.3", prompts: [
          "Use instructor, student and project (proj_guide)",
          "Build two different ternary instances with the same three binary projections",
          "What does the artificial-entity-set approach add?"] },
        { k: "cq", id: "CQ6.3", look: "Where to look: DSC 7th ed., §6.4–6.5, §6.11; §4.4, §5.3", prompts: [
          "Which constraints can the notation express?",
          "Where can the rule be enforced: check, trigger, procedure, application?",
          "Who keeps the written rules up to date?"] },
      ] },
  ],
  back: [
    { k: "list", h: "Practice exercises", src: "Exercises written for IDB201; more: DSC Practice Exercises 6.1–6.8, pp. 291–294 (draw them in draw.io)", items: [
      "section is a weak entity set identified by course through sec_course, discriminator (sec_id, semester, year). Give its relation schema with keys.",
      "A student has at most one advisor; an instructor advises any number of students. Give the cardinality and two ways to store advisor.",
      "An instructor can have several phone numbers. How is this multivalued attribute reduced to relations?"] },
    { k: "list", h: "Practice exercises: answers", src: "Answers written for IDB201 on DSC 7th ed., §6.4–6.7", fill: HEX.pale, items: [
      "section(course_id, sec_id, semester, year, building, room_number, time_slot_id); key: the first four; course_id → course; no sec_course relation.",
      "Many-to-one from student to instructor: advisor(s_ID, i_ID) with key s_ID, or a nullable advisor_ID in student with a foreign key.",
      "inst_phone(ID, phone_number), primary key (ID, phone_number), foreign key ID → instructor."] },
    { k: "cards", h: "Summary", src: "DSC 7th ed., Ch. 6", cols: 3, num: false, cards: [
      ["Design process", "Requirements, conceptual, logical, physical"],
      ["E-R model", "Entity sets, relationship sets, attributes, roles"],
      ["Constraints", "Cardinalities, participation, l..h limits"],
      ["Keys", "Of relationship sets; weak entity sets"],
      ["Reduction", "Rules; redundant and combined schemas"],
      ["Design issues", "Alternatives and the limits of E-R", HEX.paleOrange]] },
    { k: "cards", h: "Before the next session", src: "IDB201 syllabus, sessions 30–32", cards: [
      ["Within one week", "Choose one of CQ6.1–CQ6.3 and submit your answer on the LMS"],
      ["Session 31", "Lab 4: read the clinic requirements (published a week before) and draft the diagram", HEX.paleOrange],
      ["Session 32", "Read DSC Ch. 7, §7.1–7.2, pp. 303–312"]] },
  ],
};
