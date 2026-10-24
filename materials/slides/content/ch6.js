// Chapter 6 – Database design using the E-R model (sessions 27, 28, 29, 30)
module.exports = {
  num: 6,
  title: "Database design using the E-R model",
  short: "The E-R model",
  sessions: [27, 28, 29, 30],
  reading: "Ch. 6, §6.1–6.7 and §6.9, pp. 241–284",
  slides: [
    { t: "outline", title: "Chapter 6 roadmap", items: [
      { session: 27, head: "E-R basics", points: ["6.1 The design process", "6.2 Entity sets and relationship sets", "6.3 Complex attributes"] },
      { session: 28, head: "Constraints and keys", points: ["6.4 Mapping cardinalities, participation", "6.5 Primary keys, weak entity sets", "6.6 Redundant attributes"] },
      { session: 29, head: "Reduction", points: ["6.7 E-R diagrams to relational schemas", "Self-study: §6.8 Extended E-R features"] },
      { session: 30, head: "Design issues", points: ["6.9 Design issues; limits of the E-R model", "Self-study: §6.10–6.11", "CQ6.1–CQ6.3"] },
    ] },

    // ---------------- Session 27 ----------------
    { t: "session", n: 27, title: "The design process, the entity-relationship model and complex attributes", reading: "DSC Ch. 6, §6.1–6.3, pp. 241–251" },
    { t: "cards", title: "6.1 Overview of the design process", lead: "Design moves from what the users need to how the data is stored.", items: [
      { head: "Requirements", body: "Find out what data the users need and what operations (functional requirements) they will perform." },
      { head: "Conceptual design", body: "Choose a data model and describe the enterprise at a high level, e.g. with an E-R diagram." },
      { head: "Logical design", body: "Map the conceptual schema to the implementation data model: relational schemas." },
      { head: "Physical design", body: "Decide file organization and indexes (Chapters 8–9 of this course)." },
    ], notes: "Two pitfalls named in DSC §6.1: redundancy (the same information repeated, leading to inconsistency) and incompleteness (aspects of the enterprise that cannot be modeled)." },
    { t: "bullets", title: "6.2 The entity-relationship model", bullets: [
      { b: "Entity:", t: "a thing or object distinguishable from all other objects, e.g. one instructor" },
      { b: "Entity set:", t: "a set of entities of the same type sharing the same attributes, e.g. instructor, student" },
      { b: "Relationship:", t: "an association among several entities; a relationship set is a set of such associations, e.g. advisor between instructor and student" },
      { b: "Descriptive attribute:", t: "an attribute of a relationship set, e.g. the date on which an instructor became a student's advisor" },
      { b: "Degree:", t: "number of participating entity sets; binary relationship sets are the most common" },
      { b: "Roles:", t: "needed when the same entity set participates more than once (recursive relationship set), e.g. course and prerequisite in prereq" },
    ], card: { head: "Diagram notation (DSC)", body: "Rectangle: entity set, attributes listed inside, primary key underlined\nDiamond: relationship set\nLines connect them" } },
    { t: "table", title: "6.3 Complex attributes", colW: [2.8, 5.2, 4.3], head: ["Kind", "Meaning", "Example (university database)"], rows: [
      ["Simple / composite", "Composite attributes are divided into subparts", "name: first_name, middle_initial, last_name"],
      ["Single- / multivalued", "A multivalued attribute holds a set of values for one entity", "{phone_number} of an instructor"],
      ["Derived", "Value computed from other attributes, not stored", "age(), derived from date_of_birth"],
      ["Domain", "Set of permitted values of an attribute", "credits: positive integers"],
      ["Null", "Value missing or not applicable", "apartment_number of a house"],
    ], caption: "Notation: composite subparts are indented, multivalued attributes in braces, derived attributes with ()." },

    // ---------------- Session 28 ----------------
    { t: "session", n: 28, title: "Mapping cardinalities, primary keys and removing redundant attributes", reading: "DSC Ch. 6, §6.4–6.6, pp. 252–263" },
    { t: "cards", title: "6.4 Mapping cardinalities", lead: "For a binary relationship set R between entity sets A and B:", items: [
      { head: "One-to-one", body: "An entity in A is associated with at most one entity in B, and vice versa." },
      { head: "One-to-many", body: "An entity in A is associated with any number of entities in B; an entity in B with at most one in A." },
      { head: "Many-to-one", body: "An entity in A is associated with at most one entity in B; an entity in B with any number in A." },
      { head: "Many-to-many", body: "Each entity in either set is associated with any number of entities in the other." },
    ], notes: "Notation: a directed line (arrow) towards an entity set means 'one'; an undirected line means 'many'. Example: advisor as one-to-many from instructor to student." },
    { t: "twocol", title: "Participation and cardinality limits", left: { head: "Participation", items: [
      "Total: every entity in E participates in at least one relationship in R (double line)",
      "Partial: some entities may not participate",
      "Example: every student must have an advisor, so student participates totally in advisor",
    ] }, right: { head: "Cardinality limits l..h", items: [
      "Written on the line between entity set and relationship set",
      "l = minimum, h = maximum number of relationships per entity; * means no limit",
      "1..1 on the student side of advisor: each student has exactly one advisor",
      "0..* on the instructor side: an instructor advises zero or more students",
    ] } },
    { t: "bullets", title: "6.5 Primary keys", bullets: [
      "Entity sets: a primary key is chosen among the attributes; no two entities have the same key value",
      "Relationship sets: a relationship is identified by the primary keys of the participating entities, plus descriptive attributes",
      { b: "Many-to-many:", t: "primary key = union of the primary keys of the participating entity sets" },
      { b: "One-to-many / many-to-one:", t: "primary key = primary key of the entity set on the 'many' side" },
      { b: "One-to-one:", t: "the primary key of either participating entity set" },
      "Non-binary relationship sets: if there is no cardinality constraint, the union of the primary keys",
    ] },
    { t: "bullets", title: "6.5 Weak entity sets", bullets: [
      "A weak entity set's existence depends on another entity set, its identifying entity set",
      "Example: section depends on course; sections are identified by course_id together with sec_id, semester and year",
      { b: "Discriminator:", t: "the attributes that distinguish weak entities of the same strong entity (sec_id, semester, year)" },
      "Primary key of the weak entity set = primary key of the identifying entity set + discriminator",
      "The weak entity set participates totally in the identifying relationship (e.g. sec_course), which is many-to-one",
    ], card: { head: "Notation", body: "Double rectangle: weak entity set\nDouble diamond: identifying relationship\nDashed underline: discriminator" } },
    { t: "bullets", title: "6.6 Removing redundant attributes in entity sets", bullets: [
      "Once relationship sets are chosen, some attributes of entity sets become redundant",
      "Example: dept_name in instructor repeats the information in the relationship inst_dept between instructor and department",
      "Remove dept_name from instructor; it reappears in the relational schema when inst_dept is reduced (session 29)",
      "Keeping both creates two places to record the same fact, a source of inconsistency",
    ], card: { head: "Design principle", body: "Each fact should be represented exactly once in the E-R model; the relational schema adds attributes back where the reduction requires them." } },

    // ---------------- Session 29 ----------------
    { t: "session", n: 29, title: "Reducing E-R diagrams to relational schemas", reading: "DSC Ch. 6, §6.7, pp. 264–270 · Self-study: §6.8 Extended E-R features, pp. 271–278" },
    { t: "table", title: "6.7 Reduction rules", colW: [3.3, 9.0], head: ["E-R construct", "Relational schema"], rows: [
      ["Strong entity set, simple attributes", "One relation with the same attributes and primary key"],
      ["Composite attribute", "One attribute per component; the composite itself is not stored, e.g. street, city, … for address"],
      ["Multivalued attribute M of E", "A separate relation: primary key of E + M, all as primary key; foreign key to E, e.g. instructor_phone(ID, phone_number)"],
      ["Derived attribute", "Not stored; can be computed in a view or a query"],
      ["Weak entity set", "Attributes + primary key of the identifying entity set; foreign key to it, e.g. section(course_id, sec_id, semester, year, …)"],
      ["Relationship set", "Primary keys of the participating entity sets + descriptive attributes; foreign keys to each entity set"],
    ], size: 13 },
    { t: "bullets", title: "Redundancy and combination of schemas", bullets: [
      "The schema of an identifying relationship (e.g. sec_course) is redundant: the weak entity set's relation already holds the same information",
      "Many-to-one relationship set from A to B with total participation of A: its schema can be combined with A's schema",
      "Example: inst_dept is combined with instructor, so instructor(ID, name, dept_name, salary) with dept_name a foreign key to department",
      "If participation is partial, combining is still possible; entities without a relationship get null in the foreign-key attributes",
    ] },
    { t: "code", title: "Implementing the reduction in SQL Server", side: "Choices made", code:
"create table instructor (\n  ID        varchar(5)  primary key,\n  name      varchar(20) not null,\n  dept_name varchar(20) references department,\n  salary    numeric(8,2));\n\ncreate table instructor_phone (     -- multivalued\n  ID           varchar(5) references instructor,\n  phone_number varchar(15),\n  primary key (ID, phone_number));\n\ncreate table advisor (              -- many-to-one\n  s_ID varchar(5) primary key references student,\n  i_ID varchar(5) not null references instructor);",
      bullets: ["The primary key of advisor is s_ID only: the 'many' side", "not null on i_ID: every advisor row names an instructor", "Total participation of student in advisor needs more than a foreign key, e.g. a trigger or a combined schema", "Lab 4 asks for this kind of implementation"], codeSize: 13 },
    { t: "bullets", title: "Self-study: §6.8 Extended E-R features", bullets: [
      { b: "Specialization:", t: "subgroups of an entity set with extra attributes, e.g. person → employee, student (ISA)" },
      { b: "Generalization:", t: "the same hierarchy found bottom-up from common features" },
      { b: "Constraints:", t: "overlapping or disjoint; total or partial" },
      { b: "Attribute inheritance:", t: "lower-level entity sets inherit attributes and relationships" },
      { b: "Aggregation:", t: "treats a relationship set as an entity set so it can take part in other relationships" },
      "Reduction of generalization: one relation per entity set (lower levels keep the key), or only lower-level relations if total",
    ], card: { head: "Assessment", body: "Self-study topic; assessed in Progress test 2 and the final exam." } },

    // ---------------- Session 30 ----------------
    { t: "session", n: 30, title: "Entity-relationship design issues; limits of the E-R model", reading: "DSC Ch. 6, §6.9, pp. 279–284 · Self-study: §6.10–6.11 Alternative notations and other aspects of design, pp. 285–291" },
    { t: "table", title: "6.9 Design issues", colW: [3.4, 8.9], head: ["Question", "Guideline from DSC §6.9"], rows: [
      ["Entity set or attribute?", "Use an entity set when we need to keep extra information about the object, e.g. phone with location and type"],
      ["Entity set or relationship set?", "Use a relationship set for an action between entities; an entity set if the action has its own identity, e.g. registration"],
      ["Binary or n-ary?", "An n-ary relationship can be replaced by an artificial entity set and n binary relationship sets, at a cost (see CQ6.2)"],
      ["Where do attributes go?", "Attributes of a one-to-many relationship set can be moved to the 'many' entity set; for many-to-many they must stay on the relationship"],
    ], size: 14 },
    { t: "bullets", title: "Limits of the E-R model", bullets: [
      "The diagram records keys, cardinalities and participation, but many business rules have no graphical notation",
      "Examples: limits that depend on aggregates (a maximum number of credits per semester), conditions over time, rules that relate attribute values of different entities",
      "Such rules are recorded as text beside the diagram and enforced by check constraints, triggers or application code (Chapters 4–5)",
      "The reduction of a ternary relationship to binary ones may lose information or constraints",
      "Normalization (Chapter 7) gives a formal test of a design, which the E-R model alone does not provide",
    ], notes: "This slide is a lecturer synthesis connecting §6.9 to the CQs; it does not quote a single DSC passage." },
    { t: "cq", code: "CQ6.1", question: "Why is a grade an attribute of the enrollment relationship and not of STUDENT or SECTION? What goes wrong if it is placed on either entity?",
      prompts: ["How many grades does one student have? One section?", "Which entity pair does one grade belong to?", "Relate to §6.9 placement of relationship attributes"], where: ["DSC §6.2 (descriptive attributes)", "DSC §6.9"] },
    { t: "cq", code: "CQ6.2", question: "Is a ternary relationship always equivalent to three binary relationships? Construct a counterexample.",
      prompts: ["Use instructor, student and project (proj_guide)", "Build two different ternary instances that give the same three binary projections", "What does the artificial entity set approach add?"], where: ["DSC §6.9 (binary versus n-ary relationship sets)"] },
    { t: "cq", code: "CQ6.3", question: "Give a business rule of the university database that cannot be drawn in an E-R diagram. How should a designer record and enforce it?",
      prompts: ["Which constraints does the notation support?", "Where can the rule be enforced: check, trigger, procedure, application?", "Who maintains the documentation?"], where: ["DSC §6.4–6.5, §6.11", "DSC §4.4, §5.3"] },
    { t: "summary", points: [
      "Design: requirements → conceptual (E-R) → logical (relational) → physical",
      "Entity sets, relationship sets, roles, complex attributes",
      "Mapping cardinalities, participation and cardinality limits",
      "Primary keys of relationship sets; weak entity sets with discriminators",
      "Reduction rules turn an E-R diagram into relational schemas",
      "Design choices and the rules an E-R diagram cannot express",
    ], next: [
      "Choose one of CQ6.1–CQ6.3 and submit an answer within one week",
      "Self-study: §6.8 Extended E-R features; §6.10–6.11",
      "Session 31: Lab 4 (E-R design and implementation)",
    ] },
  ],
};
