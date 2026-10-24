// Chapter 7 – Relational database design (sessions 32, 33, 34, 35, 36, 37)
module.exports = {
  num: 7,
  title: "Relational database design: functional dependencies and normal forms",
  short: "Normalization",
  sessions: [32, 33, 34, 35, 36, 37],
  reading: "Ch. 7, §7.1–7.6 and §7.8, pp. 303–342",
  slides: [
    { t: "outline", title: "Chapter 7 roadmap", items: [
      { session: "32–33", head: "Good designs", points: ["7.1 Redundancy and anomalies", "7.2 Decomposition using FDs", "7.3 BCNF and 3NF"] },
      { session: "34–35", head: "FD theory", points: ["7.4 Closure, Armstrong's axioms, attribute closure", "Canonical cover, lossless decomposition, dependency preservation"] },
      { session: "36", head: "Algorithms", points: ["7.5 BCNF decomposition", "3NF synthesis"] },
      { session: "37", head: "Beyond FDs", points: ["7.6 Multivalued dependencies, 4NF", "7.8 Atomic domains and 1NF", "CQ7.1–CQ7.3"] },
    ] },

    // ---------------- Session 32 ----------------
    { t: "session", n: 32, title: "Features of good relational designs; decomposition using functional dependencies", reading: "DSC Ch. 7, §7.1–7.2, pp. 303–312" },
    { t: "table", title: "7.1 A bad design: in_dep = instructor ⋈ department", colW: [1.4, 1.9, 1.6, 2.2, 2.4, 1.6], mono: true, head: ["ID", "name", "salary", "dept_name", "building", "budget"], rows: [
      ["22222", "Einstein", "95000", "Physics", "Watson", "70000"],
      ["33456", "Gold", "87000", "Physics", "Watson", "70000"],
      ["10101", "Srinivasan", "65000", "Comp. Sci.", "Taylor", "100000"],
      ["45565", "Katz", "75000", "Comp. Sci.", "Taylor", "100000"],
    ], caption: "Building and budget are repeated for every instructor of a department.", lead: "Rows from the university sample data, combined into one relation:" },
    { t: "cards", title: "Problems caused by redundancy", items: [
      { head: "Update anomaly", body: "Changing the Physics budget requires updating every Physics instructor's tuple; missing one makes the data inconsistent." },
      { head: "Insertion anomaly", body: "A new department without instructors cannot be stored unless nulls are used for the instructor attributes." },
      { head: "Deletion anomaly", body: "Deleting the last instructor of a department also deletes the department's building and budget." },
    ], notes: "DSC §7.1 discusses the repeated budget and the need for nulls when a department has no instructors." },
    { t: "bullets", title: "Decomposition: lossless and lossy", bullets: [
      "A decomposition replaces schema R by R1, R2 with R = R1 ∪ R2",
      { b: "Lossless:", t: "for every legal instance r, Π_R1(r) ⋈ Π_R2(r) = r" },
      { b: "Lossy:", t: "the join returns extra tuples, so we no longer know which tuples were in r" },
      "Example: employee(ID, name, street, city, salary) split into (ID, name) and (name, street, city, salary)",
      "Two employees with the same name produce spurious tuples in the join: the decomposition is lossy",
      "A lossy decomposition loses information even though it returns more tuples",
    ] },
    { t: "bullets", title: "7.2 Functional dependencies", bullets: [
      { b: "Definition:", t: "α → β holds on R if, for all pairs of tuples t1, t2 in any legal instance, t1[α] = t2[α] implies t1[β] = t2[β]" },
      { b: "Superkey:", t: "K is a superkey of R iff K → R" },
      { b: "Trivial FD:", t: "α → β is trivial if β ⊆ α" },
      { b: "Closure F⁺:", t: "the set of all FDs logically implied by F" },
      "FDs are constraints on all legal instances; one instance can refute an FD but never prove it",
      { b: "Lossless test:", t: "R1, R2 is lossless if R1 ∩ R2 → R1 or R1 ∩ R2 → R2 is in F⁺" },
    ], card: { head: "in_dep", body: "dept_name → building, budget\nID → name, salary, dept_name\nThe decomposition into department and instructor is lossless: the common attribute dept_name is a key of department." } },

    // ---------------- Session 33 ----------------
    { t: "session", n: 33, title: "Normal forms: Boyce–Codd normal form and third normal form", reading: "DSC Ch. 7, §7.3, pp. 313–319" },
    { t: "bullets", title: "7.3 Boyce–Codd normal form (BCNF)", bullets: [
      "R is in BCNF with respect to F if, for every α → β in F⁺ with α ∪ β ⊆ R, at least one holds:",
      { t: "α → β is trivial (β ⊆ α)", sub: true },
      { t: "α is a superkey of R", sub: true },
      "in_dep is not in BCNF: dept_name → building, budget holds, but dept_name is not a superkey",
      { b: "Decomposition step:", t: "for a violating α → β, replace R by (α ∪ β) and (R − (β − α))" },
      "in_dep → (dept_name, building, budget) and (ID, name, salary, dept_name)",
    ], card: { head: "Why it is lossless", body: "The two schemas share α, and α → α ∪ β, so the lossless test of §7.2 is satisfied." } },
    { t: "twocol", title: "BCNF and dependency preservation", lead: "dept_advisor(s_ID, i_ID, dept_name), F = { i_ID → dept_name;  s_ID, dept_name → i_ID }",
      left: { head: "The problem", items: [
        "i_ID → dept_name violates BCNF: i_ID is not a superkey",
        "BCNF decomposition: (s_ID, i_ID) and (i_ID, dept_name)",
        "No schema contains s_ID, dept_name and i_ID together",
        "s_ID, dept_name → i_ID can be checked only by a join: it is not preserved",
      ] }, right: { head: "The consequence", items: [
        "A BCNF decomposition that preserves all dependencies does not always exist",
        "Third normal form relaxes BCNF so that a dependency-preserving decomposition always exists",
        "Requirement in words: an instructor belongs to one department; a student has at most one advisor per department",
      ] } },
    { t: "bullets", title: "Third normal form (3NF)", bullets: [
      "R is in 3NF with respect to F if, for every α → β in F⁺, at least one holds:",
      { t: "α → β is trivial", sub: true },
      { t: "α is a superkey of R", sub: true },
      { t: "each attribute A in β − α is contained in a candidate key of R", sub: true },
      "Every BCNF schema is in 3NF; the third condition is the relaxation",
      "dept_advisor is in 3NF: dept_name is part of the candidate key (s_ID, dept_name)",
    ], card: { head: "Price of 3NF", body: "Some redundancy may remain (dept_name repeated for an instructor), and nulls may be needed to record some facts." } },
    { t: "table", title: "Comparing BCNF and 3NF", colW: [5.0, 3.6, 3.6], head: ["Property", "BCNF", "3NF"], rows: [
      ["Redundancy due to FDs", "Eliminated", "May remain"],
      ["Lossless decomposition always possible", "Yes", "Yes"],
      ["Dependency preservation always possible", "No", "Yes"],
      ["Test on one schema", "Polynomial with attribute closure", "NP-hard in general (prime attributes)"],
    ], caption: "Design goal: BCNF, lossless, dependency preserving; when this is impossible, choose between BCNF and 3NF (CQ7.2)." },

    // ---------------- Session 34 ----------------
    { t: "session", n: 34, title: "Functional-dependency theory: closure of a set of FDs, Armstrong's axioms, attribute closure", reading: "DSC Ch. 7, §7.4, pp. 320–329" },
    { t: "table", title: "Armstrong's axioms and derived rules", colW: [3.0, 5.0, 4.3], head: ["Rule", "Statement", "Status"], rows: [
      ["Reflexivity", "If β ⊆ α, then α → β", "Axiom"],
      ["Augmentation", "If α → β, then γα → γβ", "Axiom"],
      ["Transitivity", "If α → β and β → γ, then α → γ", "Axiom"],
      ["Union", "If α → β and α → γ, then α → βγ", "Derived from the axioms"],
      ["Decomposition", "If α → βγ, then α → β and α → γ", "Derived from the axioms"],
      ["Pseudotransitivity", "If α → β and γβ → δ, then αγ → δ", "Derived from the axioms"],
    ], caption: "The axioms are sound (they derive only FDs that hold) and complete (they derive all of F⁺)." },
    { t: "bullets", title: "Proof of soundness: augmentation", bullets: [
      "Assume α → β holds on r. Take any t1, t2 in r with t1[γα] = t2[γα]",
      "Then t1[γ] = t2[γ] and t1[α] = t2[α]",
      "Because α → β holds, t1[β] = t2[β]",
      "So t1[γβ] = t2[γβ], hence γα → γβ holds",
      "Exercise: prove transitivity in the same way; derive union from augmentation and transitivity",
    ], card: { head: "Proof of union", body: "α → β gives α → αβ (augment with α).\nα → γ gives αβ → βγ (augment with β).\nTransitivity: α → βγ." } },
    { t: "code", title: "Attribute closure α⁺", side: "Example (DSC §7.4)", code:
"result := α;\nrepeat\n    for each FD β → γ in F do\n        if β ⊆ result then\n            result := result ∪ γ;\nuntil result does not change;\nreturn result;   -- α⁺",
      bullets: ["R = (A, B, C, G, H, I)", "F = { A → B, A → C, CG → H, CG → I, B → H }", "(AG)⁺: AG → ABCG (A → B, A → C) → ABCGHI (CG → H, CG → I)", "AG is a superkey; neither A⁺ nor G⁺ is R, so AG is a candidate key"] },
    { t: "cards", title: "Uses of attribute closure", items: [
      { head: "Superkey test", body: "α is a superkey iff α⁺ contains all attributes of R." },
      { head: "FD test", body: "α → β is in F⁺ iff β ⊆ α⁺, without computing F⁺." },
      { head: "Computing F⁺", body: "For each γ ⊆ R, compute γ⁺ and output γ → S for every S ⊆ γ⁺ (exponential)." },
    ] },

    // ---------------- Session 35 ----------------
    { t: "session", n: 35, title: "FD theory (cont.): canonical cover, lossless decomposition, dependency preservation; proofs of soundness", reading: "DSC Ch. 7, §7.4, pp. 320–329" },
    { t: "bullets", title: "Extraneous attributes and canonical cover", bullets: [
      { b: "Extraneous in α:", t: "for A ∈ α, A is extraneous if F logically implies (F − {α → β}) ∪ {(α − A) → β}; test: compute (α − A)⁺ under F, check β ⊆ result" },
      { b: "Extraneous in β:", t: "for A ∈ β, A is extraneous if (F − {α → β}) ∪ {α → (β − A)} logically implies F; test: compute α⁺ under the new set, check A ∈ result" },
      { b: "Canonical cover Fc:", t: "equivalent to F, no extraneous attributes, and each left side unique" },
      "Algorithm: repeat (union FDs with the same left side; remove one extraneous attribute) until nothing changes",
    ], card: { head: "Example (DSC §7.4)", body: "R = (A, B, C)\nF = { A → BC, B → C, A → B, AB → C }\nA is extraneous in AB → C; C is extraneous in A → BC\nFc = { A → B, B → C }" } },
    { t: "code", title: "Dependency preservation", side: "Meaning and test", code:
"-- does decomposition {R1, ..., Rn} preserve α → β?\nresult := α;\nrepeat\n    for each Ri in the decomposition do\n        t := (result ∩ Ri)⁺ ∩ Ri;\n        result := result ∪ t;\nuntil result does not change;\n-- preserved iff β ⊆ result",
      bullets: ["Fi = restriction of F⁺ to Ri: FDs that can be checked inside Ri alone", "The decomposition is dependency preserving if (F1 ∪ … ∪ Fn)⁺ = F⁺", "The test on the left takes polynomial time and never computes F⁺", "If an FD is not preserved, checking it needs a join on every update"] },
    { t: "bullets", title: "Lossless decomposition: why the test works", bullets: [
      "Claim: if R1 ∩ R2 → R1, then Π_R1(r) ⋈ Π_R2(r) = r",
      "r ⊆ join: every tuple of r agrees with its own projections (always true)",
      "join ⊆ r: a joined tuple comes from t1 ∈ Π_R1(r) and t2 ∈ Π_R2(r) that agree on R1 ∩ R2",
      "t2 is the projection of some u ∈ r; u[R1 ∩ R2] = t1[R1 ∩ R2], and R1 ∩ R2 → R1 forces u[R1] = t1",
      "So the joined tuple is u itself, which is in r",
    ], notes: "The condition is sufficient; DSC §7.4 notes it is necessary only when all constraints are FDs. This proof sketch is a lecturer addition supporting the 'proofs of soundness' item of session 35." },

    // ---------------- Session 36 ----------------
    { t: "session", n: 36, title: "Algorithms for decomposition: BCNF decomposition and 3NF synthesis", reading: "DSC Ch. 7, §7.5, pp. 330–335" },
    { t: "code", title: "BCNF decomposition algorithm", side: "Notes", code:
"result := {R}; done := false;\nwhile not done do\n    if some Ri in result is not in BCNF then\n        let α → β be a nontrivial FD that\n            holds on Ri, with α → Ri not in F⁺\n            and α ∩ β = ∅;\n        result := (result − Ri) ∪ (Ri − β) ∪ (α, β);\n    else done := true;",
      bullets: ["Each step is lossless, so the result is lossless", "The result is in BCNF but may not preserve dependencies", "Testing a decomposed Ri: for each α ⊆ Ri, α⁺ must contain either no attribute of Ri − α or all of Ri", "Using only F (not F⁺) is enough to test the original schema R, not a decomposed Ri"] },
    { t: "code", title: "3NF synthesis algorithm", side: "Example (DSC §7.5)", code:
"let Fc be a canonical cover for F;  i := 0;\nfor each α → β in Fc do\n    i := i + 1;  Ri := α β;\nif no Rj contains a candidate key for R then\n    i := i + 1;  Ri := any candidate key for R;\n-- optionally remove redundant relations\nrepeat\n    if some Rj is contained in another Rk then\n        delete Rj;\nuntil no more Rj can be deleted;\nreturn (R1, R2, ..., Ri);",
      bullets: ["cust_banker_branch(customer_id, employee_id, branch_name, type)", "Fc = { customer_id, employee_id → type;  employee_id → branch_name;  customer_id, branch_name → employee_id }", "Schemas: (customer_id, employee_id, type), (customer_id, branch_name, employee_id); (employee_id, branch_name) is removed as contained", "Result: lossless, dependency preserving, 3NF"], codeSize: 13 },

    // ---------------- Session 37 ----------------
    { t: "session", n: 37, title: "Multivalued dependencies and 4NF (overview); atomic domains and first normal form", reading: "DSC Ch. 7, §7.6, §7.8, pp. 336–340, 342 · Self-study: §7.7 More normal forms, p. 341; §7.9 Database-design process, pp. 343–346" },
    { t: "bullets", title: "7.6 Multivalued dependencies and 4NF", bullets: [
      "Some BCNF schemas still contain redundancy that FDs cannot describe",
      "Example: an instructor's children and phone numbers stored together in (ID, child_name, phone_number): every child is paired with every phone",
      { b: "MVD α →→ β:", t: "for tuples agreeing on α, the β-values and the values of the remaining attributes are independent" },
      "Every FD is also an MVD: if α → β then α →→ β",
      { b: "4NF:", t: "for every nontrivial α →→ β in D⁺, α is a superkey; every 4NF schema is in BCNF" },
      "4NF decomposition: (ID, child_name) and (ID, phone_number)",
    ] },
    { t: "bullets", title: "7.8 Atomic domains and first normal form", bullets: [
      "A domain is atomic if its elements are considered indivisible units",
      "R is in first normal form (1NF) if the domains of all attributes are atomic",
      "Non-atomic examples: a set of names as one value; a composite attribute stored as one value",
      "Atomicity depends on how the data is used: a course identifier such as CS-101 is non-atomic if programs extract the department from it",
      "The relational model of this course assumes 1NF (Chapter 2)",
    ], card: { head: "Self-study: §7.7, §7.9", body: "§7.7: other normal forms (e.g. PJNF, DKNF, second normal form).\n§7.9: E-R modeling and normalization together; denormalization for performance." } },
    { t: "cq", code: "CQ7.1", question: "Every normal form can be seen as removing one kind of redundancy. What single idea unifies them?",
      prompts: ["What does a violating dependency say about repeated values?", "Compare the BCNF and 4NF conditions", "What role does 'superkey' play in each?"], where: ["DSC §7.3, §7.6", "Self-study: §7.7"] },
    { t: "cq", code: "CQ7.2", question: "BCNF decomposition may lose a dependency. When would you accept 3NF instead, and what do you gain?",
      prompts: ["Use dept_advisor as the example", "What does an unpreserved FD cost on each update?", "What redundancy does 3NF keep?"], where: ["DSC §7.3 (BCNF and dependency preservation; comparison)"] },
    { t: "cq", code: "CQ7.3", question: "Testing whether an attribute is prime is NP-complete. What does this mean for automatic schema design tools?",
      prompts: ["Which normal-form test needs prime attributes?", "How many candidate keys can a schema have?", "Do real schemas reach the worst case?"], where: ["DSC §7.3, §7.5 (testing for 3NF)", "Lucchesi & Osborn, Candidate keys for relations, JCSS 17(2), 1978"] },
    { t: "summary", points: [
      "Redundancy causes update, insertion and deletion anomalies",
      "FDs formalize when a decomposition is lossless",
      "BCNF removes FD redundancy; 3NF always allows dependency preservation",
      "Armstrong's axioms are sound and complete; attribute closure tests FDs and keys",
      "Canonical covers and dependency-preservation tests drive the algorithms",
      "BCNF decomposition and 3NF synthesis; MVDs and 4NF; 1NF and atomic domains",
    ], next: [
      "Choose one of CQ7.1–CQ7.3 and submit an answer within one week",
      "Self-study: §7.7 and §7.9",
      "Session 38: guided exercises; session 39: project milestone 1; session 40: Progress test 2",
    ] },
  ],
};
