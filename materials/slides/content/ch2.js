// Chapter 2 – The relational model and relational algebra (sessions 4, 5, 6)
module.exports = {
  num: 2,
  title: "The relational model and relational algebra",
  short: "Relational model and algebra",
  sessions: [4, 5, 6],
  reading: "Ch. 2, §2.1–2.6, pp. 37–57",
  slides: [
    { t: "outline", title: "Chapter 2 roadmap", items: [
      { session: 4, head: "The relational model", points: ["2.1 Structure of relational databases", "2.2 Database schema", "2.3 Keys", "2.4 Schema diagrams", "Relations as sets; keys and constraints as logic"] },
      { session: 5, head: "Relational algebra (1)", points: ["2.5 Relational query languages", "Select, project, union, set difference", "Cartesian product, rename"] },
      { session: 6, head: "Relational algebra (2)", points: ["Joins, intersection, assignment", "Equivalent queries", "Division and aggregation as extended operators"] },
    ] },

    // ---------------- Session 4 ----------------
    { t: "session", n: 4, title: "Structure of relational databases, database schema, keys, schema diagrams; the relational model as mathematics", reading: "DSC Ch. 2, §2.1–2.4, pp. 37–46" },
    { t: "bullets", title: "2.1 Structure of relational databases", bullets: [
      "A relational database is a collection of tables; each table has a unique name",
      { b: "Relation", t: "= table, " },
      { b: "tuple", t: "= row, attribute = column" },
      "The domain of an attribute is its set of permitted values; domains are required to be atomic (indivisible)",
      "The null value signifies that a value is unknown or does not exist; nulls cause difficulties and are avoided where possible",
      "The order of tuples in a relation is irrelevant: a relation is a set of tuples",
    ], card: { head: "Vocabulary", body: "Relation instance: the specific set of tuples a relation contains at a given time." } },
    { t: "bullets", title: "The relational model as mathematics", bullets: [
      "Given domains D1, …, Dn, a relation r is a subset of the Cartesian product D1 × D2 × … × Dn",
      "Because r is a set: no duplicate tuples and no order among tuples",
      "A tuple is a mapping from attribute names to values; attribute order carries no meaning",
      "Constraints are statements of logic that every legal instance must satisfy",
      { t: "Key constraint for K on r:  ∀ t1, t2 ∈ r : t1[K] = t2[K] ⇒ t1 = t2", sub: true },
      { t: "Foreign key from r[A] to s[B]:  ∀ t ∈ r : ∃ u ∈ s : t[A] = u[B]", sub: true },
    ], card: { head: "Why it matters", body: "Treating relations as sets is what makes relational algebra (sessions 5–6) and design theory (Chapter 7) possible. SQL tables are bags, not sets – see the self-study on bag semantics in Chapter 3." } },
    { t: "code", title: "2.2 Database schema: schema vs. instance", side: "University schema (part)", code:
"department(dept_name, building, budget)\ncourse(course_id, title, dept_name, credits)\ninstructor(ID, name, dept_name, salary)\nsection(course_id, sec_id, semester, year,\n        building, room_number, time_slot_id)\nteaches(ID, course_id, sec_id, semester, year)\nstudent(ID, name, dept_name, tot_cred)\ntakes(ID, course_id, sec_id, semester, year, grade)\nadvisor(s_ID, i_ID)\nprereq(course_id, prereq_id)",
      bullets: ["A relation schema is a list of attributes with their domains", "A relation instance changes over time; the schema rarely does", "These schemas follow the university database of DSC (Appendix A)"] },
    { t: "table", title: "2.3 Keys", colW: [2.4, 5.4, 4.5], head: ["Concept", "Definition", "University example"], rows: [
      ["Superkey", "A set of one or more attributes whose values uniquely identify a tuple", "{ID}, {ID, name} on instructor"],
      ["Candidate key", "A minimal superkey: no proper subset is a superkey", "{ID} on instructor"],
      ["Primary key", "The candidate key chosen by the designer as the principal means of identification", "ID for instructor; (course_id, sec_id, semester, year) for section"],
      ["Foreign key", "Attributes of the referencing relation whose values must appear as the primary key of the referenced relation", "instructor.dept_name references department"],
      ["Referential integrity constraint", "Values in specified attributes of a referencing tuple must appear in specified attributes of some referenced tuple (need not be a primary key)", "section.time_slot_id must appear in time_slot"],
    ] },
    { t: "cards", title: "2.4 Schema diagrams", items: [
      { head: "Boxes", body: "Each relation is a box: its name on top, its attributes listed inside." },
      { head: "Primary keys", body: "Primary-key attributes are underlined." },
      { head: "Foreign keys", body: "Arrows from foreign-key attributes of the referencing relation to the primary key of the referenced relation." },
      { head: "Other referential constraints", body: "Referential integrity constraints that are not foreign keys are drawn with a two-headed arrow." },
    ], notes: "Show the schema diagram of the university database from DSC §2.4 on the board or from the textbook." },

    // ---------------- Session 5 ----------------
    { t: "session", n: 5, title: "Relational query languages; relational algebra: select, project, union, set difference, Cartesian product, rename", reading: "DSC Ch. 2, §2.5–2.6, pp. 47–57" },
    { t: "cards", title: "2.5 Relational query languages", items: [
      { head: "Imperative", body: "The user tells the system to perform a specific sequence of operations." },
      { head: "Functional", body: "Computation is the evaluation of functions on data; relational algebra is a functional language." },
      { head: "Declarative", body: "The user describes the desired information without steps; tuple and domain relational calculus are declarative." },
    ], lead: "Relational algebra and relational calculus are “pure” languages: terse and formal, they show the fundamental techniques behind SQL." },
    { t: "table", title: "The operators of relational algebra", colW: [3.2, 2.0, 7.1], head: ["Operation", "Symbol", "Meaning"], rows: [
      ["Select", "σ", "Tuples that satisfy a predicate"],
      ["Project", "Π", "Chosen attributes; duplicates are removed (relations are sets)"],
      ["Union", "∪", "Tuples in either input (inputs must be compatible)"],
      ["Set difference", "−", "Tuples in the first input but not the second"],
      ["Cartesian product", "×", "Every tuple of the first combined with every tuple of the second"],
      ["Rename", "ρ", "Gives a name to a relation (and optionally its attributes)"],
      ["Join", "⋈", "Cartesian product followed by a selection (session 6)"],
      ["Intersection", "∩", "Tuples in both inputs (session 6)"],
      ["Assignment", "←", "Stores an intermediate result in a temporary relation (session 6)"],
    ] },
    { t: "code", title: "Select and project", side: "Notes", code:
"σ dept_name = \"Physics\" (instructor)\n\nσ dept_name = \"Physics\" ∧ salary > 90000 (instructor)\n\nΠ ID, name, salary (instructor)\n\n-- composition: names of physics instructors\nΠ name (σ dept_name = \"Physics\" (instructor))",
      bullets: ["Selection predicates use =, ≠, <, ≤, >, ≥ combined with ∧ (and), ∨ (or), ¬ (not)", "Projection returns a set, so duplicate rows are eliminated", "The result of every operation is a relation, so operations compose"] },
    { t: "code", title: "Union, set difference and compatibility", side: "Compatibility", code:
"-- courses taught in Fall 2017 or in Spring 2018\nΠ course_id (σ semester = \"Fall\" ∧ year = 2017 (section))\n  ∪\nΠ course_id (σ semester = \"Spring\" ∧ year = 2018 (section))\n\n-- taught in Fall 2017 but not in Spring 2018\nΠ course_id (σ semester = \"Fall\" ∧ year = 2017 (section))\n  −\nΠ course_id (σ semester = \"Spring\" ∧ year = 2018 (section))",
      bullets: ["Both inputs must have the same number of attributes (same arity)", "Corresponding attribute types must be compatible", "Example in the style of DSC §2.6"] },
    { t: "code", title: "Cartesian product and rename", side: "Notes", code:
"-- every instructor paired with every teaches tuple\ninstructor × teaches\n\n-- keep only matching pairs\nσ instructor.ID = teaches.ID (instructor × teaches)\n\n-- rename: compare a relation with itself\nΠ instructor.salary\n  (σ instructor.salary < d.salary\n     (instructor × ρ d (instructor)))",
      bullets: ["If r has n1 tuples and s has n2, r × s has n1 · n2 tuples", "Attributes with the same name are distinguished by relation name", "ρ x (E) returns E under the name x; needed to use one relation twice", "The last query returns every salary that is smaller than some other salary"] },

    // ---------------- Session 6 ----------------
    { t: "session", n: 6, title: "Relational algebra (cont.): joins, intersection, assignment, equivalent queries; division and aggregation as extended operators", reading: "DSC Ch. 2, §2.6, pp. 48–57 · Self-study: relational calculus (DSC online Ch. 27) with worksheet" },
    { t: "code", title: "The join operation", side: "Definition", code:
"r ⋈θ s  =  σθ (r × s)\n\n-- instructors with the courses they teach\ninstructor ⋈ instructor.ID = teaches.ID teaches\n\n-- names and course ids\nΠ name, course_id\n  (instructor ⋈ instructor.ID = teaches.ID teaches)",
      bullets: ["A join combines a Cartesian product and a selection into one operation", "θ is a predicate over the attributes of r and s", "Writing the join directly is clearer and lets a system evaluate it efficiently (Chapter 9)"] },
    { t: "twocol", title: "Intersection and assignment", left: { head: "Set intersection ∩", items: [
      "r ∩ s contains the tuples in both r and s",
      "Inputs must be compatible, as for union",
      "Not a basic operator: r ∩ s = r − (r − s)",
    ] }, right: { head: "Assignment ←", items: [
      "temp ← E stores the result of E under the name temp",
      "Breaks a long expression into readable steps",
      "Adds no expressive power: the name can be replaced by its expression",
    ] } },
    { t: "code", title: "Equivalent queries", side: "Same result, different form", code:
"-- query A\nσ dept_name = \"Physics\" ∧ salary > 90000 (instructor)\n\n-- query B\nσ dept_name = \"Physics\" (σ salary > 90000 (instructor))\n\n-- query C\nσ dept_name = \"Physics\" (instructor ⋈ instructor.ID = teaches.ID teaches)\n-- query D\n(σ dept_name = \"Physics\" (instructor)) ⋈ instructor.ID = teaches.ID teaches",
      bullets: ["Two expressions are equivalent if they give the same result on every database instance", "A and B: a conjunctive selection equals a cascade of selections", "C and D: a selection can be pushed below the join", "Query optimizers use such equivalences (Chapter 9)"] },
    { t: "code", title: "Extended operator: division", side: "“For all” queries", code:
"-- students who have taken ALL Biology courses\nΠ ID, course_id (takes)\n  ÷\nΠ course_id (σ dept_name = \"Biology\" (course))\n\n-- division expressed with basic operators,\n-- for r(R) and s(S), S ⊆ R:\nr ÷ s = Π R−S (r) −\n        Π R−S ((Π R−S (r) × s) − Π R−S,S (r))",
      bullets: ["r ÷ s returns the tuples t such that, for every tuple u of s, the combination of t and u is in r", "Division adds no expressive power: it is definable from the basic operators", "Relational calculus expresses the same idea with ∀ (self-study)"] },
    { t: "code", title: "Extended operator: aggregation", side: "Notes", code:
"-- average salary in each department\ndept_name 𝒢 avg(salary) (instructor)\n\n-- total budget of all departments\n𝒢 sum(budget) (department)\n\n-- number of distinct instructors teaching\n-- in Spring 2018\n𝒢 count-distinct(ID)\n   (σ semester = \"Spring\" ∧ year = 2018 (teaches))",
      bullets: ["G1, …, Gn 𝒢 F1(A1), …, Fm(Am) (E) groups E by the G attributes and applies an aggregate function to each group", "Aggregate functions: sum, avg, count, min, max", "Aggregation goes beyond the basic algebra; SQL's group by (Chapter 3) corresponds to it"] },
    { t: "bullets", title: "Self-study: relational calculus (online Ch. 27)", bullets: [
      { b: "Tuple relational calculus:", t: "queries of the form { t | P(t) }, with ∃ and ∀ over tuples" },
      { b: "Domain relational calculus:", t: "variables range over attribute values instead of whole tuples" },
      { b: "Safety:", t: "only expressions whose result is finite and built from values in the database are allowed" },
      { b: "Codd's theorem:", t: "relational algebra and safe relational calculus have the same expressive power" },
      "Complete the worksheet; it is reviewed in session 8 and assessed in Progress test 1",
    ], card: { head: "Example (TRC)", body: "Instructors earning more than 80,000:\n{ t | t ∈ instructor ∧ t[salary] > 80000 }" } },
    { t: "summary", points: [
      "A relation is a set of tuples over atomic domains; schema ≠ instance",
      "Superkey, candidate key, primary key, foreign key and referential integrity",
      "Relational algebra: σ, Π, ∪, −, ×, ρ, plus ⋈, ∩, ← defined from them",
      "Equivalent expressions give the same result on every instance",
      "Division (“for all”) and aggregation extend the basic algebra",
    ], next: [
      "Complete the relational-calculus worksheet (DSC online Ch. 27)",
      "Session 7: assignment introduction",
      "Session 8: guided exercises (DSC Ch. 2 Exercises, pp. 60–62) and CQ2.1–CQ2.3",
    ] },
  ],
};
