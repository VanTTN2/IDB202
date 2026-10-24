// Chapter 8 – Storage and indexing (sessions 41, 42, 43, 44)
// Session 41 is not in the owner's list for Chapter_8.pptx, but the Schedule
// assigns "Slides: Chapter 8" to it; its slides can be removed if not wanted.
module.exports = {
  num: 8,
  title: "Data storage structures and indexing",
  short: "Storage and indexing",
  sessions: [41, 42, 43, 44],
  reading: "DSC Ch. 13, §13.1–13.3, §13.5; Ch. 14, §14.1–14.3, §14.5, §14.7",
  slides: [
    { t: "outline", title: "Chapter 8 roadmap", items: [
      { session: 41, head: "Storage", points: ["13.1 Storage architecture", "13.2–13.3 Files and records", "13.5 Database buffer"] },
      { session: 42, head: "Indexing", points: ["14.1 Basic concepts", "14.2 Ordered indices", "14.3 B+-trees: structure, search, height"] },
      { session: 43, head: "Updates and hashing", points: ["14.3 B+-tree insertion, deletion", "14.5 Hash indices", "14.7 Creation of indices"] },
      { session: 44, head: "Exercises", points: ["B+-tree insertion by hand", "I/O cost: index versus scan", "CQ8.1–CQ8.3"] },
    ] },

    // ---------------- Session 41 ----------------
    { t: "session", n: 41, title: "Database storage architecture, file organization, organization of records, database buffer", reading: "DSC Ch. 13, §13.1–13.3, pp. 587–601; §13.5, pp. 604–610 · Self-study: §12.1, pp. 559–561; §12.6, pp. 577–579; §13.4, pp. 602–603",
      notes: "Session 41 was not listed in the request for Chapter_8.pptx; it is included because the Schedule assigns Slides: Chapter 8 to it. Remove these slides if they are not needed." },
    { t: "bullets", title: "13.1 Database storage architecture", bullets: [
      "Persistent data lives on non-volatile storage (magnetic disk, flash/SSD); it must be brought into main memory to be processed",
      "A database is mapped to files, maintained by the operating system or by the database system",
      "Files are divided into fixed-size blocks: the unit of storage allocation and of data transfer",
      "A block holds several records; the cost of a query is dominated by the number of block transfers",
      "Goal of file organization: minimize block transfers by keeping related records in the same block",
    ], card: { head: "SQL Server note", body: "Data files are divided into 8 KB pages; 8 contiguous pages form an extent. A page is the unit of I/O." } },
    { t: "twocol", title: "13.2 File organization", lead: "Records of fixed and of variable length:", left: { head: "Fixed-length records", items: [
      "Record i starts at byte n × (i − 1), where n is the record size",
      "Deletion: move records, or keep a free list of deleted slots linked from the file header",
      "Records should not cross block boundaries",
    ] }, right: { head: "Variable-length records", items: [
      "Arise from varchar attributes, nullable attributes and multiple record types",
      "Slotted-page structure: a block header records the number of entries, the end of free space, and the location and size of each record",
      "Records can move inside the page; outside pointers point to the header entry",
      "Large objects (blob, clob) are often stored separately and referenced from the record",
    ] } },
    { t: "table", title: "13.3 Organization of records in files", colW: [3.4, 8.9], head: ["Organization", "Idea"], rows: [
      ["Heap file", "A record can be placed anywhere there is space; free-space maps help find space"],
      ["Sequential file", "Records stored in search-key order, linked by pointers; good for ordered reads, needs reorganization after many inserts"],
      ["Multitable clustering", "Related records of several relations stored in the same block, e.g. a department with its instructors"],
      ["B+-tree file organization", "Records stored in the leaves of a B+-tree (session 43)"],
      ["Hashing", "A hash function on an attribute decides the block of each record"],
      ["Partitioning", "A relation is split into smaller relations, e.g. by year, stored separately"],
    ], caption: "SQL Server: a table without a clustered index is a heap; with one, rows are stored in the leaf level of a B+-tree." },
    { t: "bullets", title: "13.5 The database buffer", bullets: [
      "The buffer is the part of main memory holding copies of disk blocks; the buffer manager allocates it",
      "A request for a block is served from the buffer if possible; otherwise a block is evicted and the requested one is read",
      { b: "Pinned blocks:", t: "a block being used may not be written back or evicted" },
      { b: "Replacement policy:", t: "LRU is common; for some access patterns, e.g. repeated scans in a nested-loop join, MRU is better; toss-immediate frees a block once it has been processed" },
      { b: "Forced output:", t: "writing a block to disk even if its space is not needed, used by recovery (Chapter 10)" },
      "The database can predict its access pattern better than the operating system, which motivates its own buffer manager",
    ] },

    // ---------------- Session 42 ----------------
    { t: "session", n: 42, title: "Indexing: basic concepts, ordered indices, B+-tree structure, search and height", reading: "DSC Ch. 14, §14.1–14.2, pp. 623–633; §14.3 (structure and queries), pp. 634–649" },
    { t: "cards", title: "14.1 Basic concepts", lead: "An index on a search key maps key values to the records that have them.", items: [
      { head: "Ordered indices", body: "Based on a sorted ordering of the search-key values." },
      { head: "Hash indices", body: "Based on distributing values uniformly across buckets with a hash function." },
      { head: "Evaluation factors", body: "Access types supported (point, range), access time, insertion time, deletion time, space overhead." },
    ] },
    { t: "twocol", title: "14.2 Ordered indices", left: { head: "Clustering versus nonclustering", items: [
      "Clustering (primary) index: its search key also defines the order of the file",
      "Nonclustering (secondary) index: search-key order differs from file order",
      "A file can have only one clustering index",
      "A secondary index must be dense: every search-key value has an entry",
    ] }, right: { head: "Dense, sparse, multilevel", items: [
      "Dense: an entry for every search-key value",
      "Sparse: entries for some values only; possible only for a clustering index",
      "Sparse index with one entry per block: a good trade-off",
      "Multilevel index: an index on the index, when the index itself is too large for memory",
    ] } },
    { t: "bullets", title: "14.3 B+-tree structure", bullets: [
      "A balanced tree: every path from the root to a leaf has the same length",
      "A node holds up to n − 1 search-key values K1 < K2 < … and up to n pointers P1 … Pn",
      { b: "Leaf nodes:", t: "between ⌈(n − 1)/2⌉ and n − 1 values; Pi points to the record(s) with Ki; Pn points to the next leaf" },
      { b: "Non-leaf nodes:", t: "between ⌈n/2⌉ and n pointers; the subtree of Pi holds values ≥ Ki−1 and < Ki" },
      { b: "Root:", t: "at least 2 children unless it is a leaf" },
      "The chained leaves allow range scans in key order",
    ], card: { head: "Non-unique keys", body: "DSC §14.3 makes search keys unique by adding a uniquifier, e.g. the primary key, to the search key." } },
    { t: "code", title: "Search and height of a B+-tree", side: "Height analysis (DSC §14.3)", code:
"function find(v)\n  C := root;\n  while C is not a leaf node do\n    i := smallest number with v <= C.Ki;\n    if there is no such i then\n        C := last non-null pointer in C\n    else if v = C.Ki then C := C.P(i+1)\n    else C := C.Pi;\n  -- C is a leaf\n  if some i has C.Ki = v then return C.Pi\n  else return null;",
      bullets: ["Path length ≤ ⌈log⌈n/2⌉(N)⌉ for N search-key values", "Example: 4 KB blocks, about 40 bytes per entry, so n ≈ 100", "N = 1,000,000: at most ⌈log50(1,000,000)⌉ = 4 nodes on the path", "A balanced binary tree would need about 20 node accesses"], codeSize: 13 },

    // ---------------- Session 43 ----------------
    { t: "session", n: 43, title: "B+-tree insertion and deletion (main idea); hash indices; creation of indices", reading: "DSC Ch. 14, §14.3 (updates), pp. 634–649; §14.5–14.7, pp. 658–664 · Self-study: §14.4, pp. 650–657; §14.6; optional §13.6, pp. 611–614; §14.8, pp. 665–669" },
    { t: "bullets", title: "B+-tree insertion", bullets: [
      "Find the leaf where the value belongs; if there is room, insert it in order",
      { b: "Leaf split:", t: "with n values, keep the first ⌈n/2⌉ in the original leaf and move the rest to a new leaf" },
      "Insert the smallest value of the new leaf, with a pointer to it, into the parent",
      { b: "Non-leaf split:", t: "keep the first ⌈(n + 1)/2⌉ pointers; the key between the two halves moves up to the parent" },
      "Splits can propagate to the root; a root split adds a level, so the tree stays balanced",
    ], card: { head: "Deletion (main idea)", body: "Remove the entry. If a node becomes too empty, coalesce it with a sibling or redistribute entries; changes may propagate up and can reduce the height." } },
    { t: "twocol", title: "14.5 Hash indices", left: { head: "Static hashing", items: [
      "A hash function h maps search-key values to buckets",
      "A bucket holds entries; overflow buckets are chained when it is full",
      "Good for equality lookups; useless for range queries",
      "Performance degrades as the file grows if the number of buckets is fixed",
    ] }, right: { head: "Beyond static hashing", items: [
      "Dynamic hashing (e.g. extendable or linear hashing) changes the number of buckets as the data grows",
      "Hashing is also used inside query processing (hash join, Chapter 9)",
      "SQL Server note: hash indexes exist only for memory-optimized tables; ordinary indexes are B+-trees",
    ] } },
    { t: "code", title: "14.7 Creation of indices", side: "Notes", code:
"create index dept_index on instructor (dept_name);\n\ncreate unique index ins_name\n    on instructor (name);        -- rejects duplicates\n\n-- SQL Server specific forms\ncreate clustered index cx_takes\n    on takes (ID, course_id, sec_id, semester, year);\ncreate nonclustered index ix_takes_course\n    on takes (course_id) include (grade);",
      bullets: ["Most systems automatically create an index on the primary key (and on unique constraints)", "SQL Server: the primary key gets a clustered index by default", "include adds non-key columns to the leaf level so a query can be answered from the index", "Each index speeds up some queries and slows down every update"] },

    // ---------------- Session 44 ----------------
    { t: "session", n: 44, title: "Guided exercises: B+-tree insertion by hand; hashing; I/O cost of index lookups versus table scans", reading: "DSC Ch. 14 Exercises, pp. 679–682" },
    { t: "bullets", title: "Exercise 1: B+-tree insertion by hand", bullets: [
      "Build a B+-tree with n = 4 (at most 3 values per leaf) by inserting, in this order:",
      { t: "2, 3, 5, 7, 11, 17, 19, 23, 29, 31", sub: true },
      "Use the split rules of session 43; draw the tree after every split",
      "Then repeat with n = 6 and compare the heights",
    ], card: { head: "Solution (n = 4)", body: "Root: [19]\nLevel 2: [5 | 11]   [29]\nLeaves: [2 3] [5 7] [11 17] [19 23] [29 31]" },
      notes: "Splits occur when inserting 7, 17, 23 and 31. Inserting 31 makes the root [5 11 19 29] overflow (5 pointers): the first 3 pointers stay with keys 5, 11; key 19 moves up to a new root; the last 2 pointers go to a new node with key 29." },
    { t: "bullets", title: "Exercise 2: hashing", bullets: [
      "A hash file has 8 buckets and h(K) = K mod 8; each bucket holds 2 entries",
      "Insert 3, 11, 19, 8, 16, 27, 5 and draw the buckets with overflow chains",
      "Which buckets overflow? What does this say about the choice of hash function for these keys?",
      "Why can this hash index not answer: K between 5 and 15?",
    ], card: { head: "Solution", body: "Bucket 3: 3, 11 → overflow 19, 27\nBucket 0: 8, 16\nBucket 5: 5\nBucket 3 overflows: keys sharing the same residue mod 8 cluster in one bucket." } },
    { t: "table", title: "Exercise 3: index lookup versus table scan", lead: "Relation r: 100,000 tuples, 100 tuples per block, so br = 1,000 blocks. Secondary B+-tree index of height 3.", colW: [5.4, 3.6, 3.3], head: ["Query", "Index plan (block transfers)", "Table scan"], rows: [
      ["Equality on a key: 1 tuple", "3 + 1 = 4", "500 on average (stop when found)"],
      ["Selection returning 50 tuples", "about 3 + 50 = 53", "1,000"],
      ["Selection returning 5,000 tuples", "about 3 + 5,000 = 5,003", "1,000"],
    ], caption: "Secondary index: in the worst case one block transfer per matching tuple. Costs follow the model of DSC §15.2–15.3 (seek costs ignored)." },
    { t: "cq", code: "CQ8.1", question: "Why is a B+-tree node the size of a disk block instead of holding a single key as in a binary search tree?",
      prompts: ["What does one block transfer cost compared with processing a node in memory?", "Compare log2(N) with log50(N) for N = 1,000,000", "What happens to the fan-out if nodes are small?"], where: ["DSC §14.3 (height analysis)", "Self-study: DSC §12.6 Disk-block access"] },
    { t: "cq", code: "CQ8.2", question: "When can a full table scan be cheaper than using an index? Design an experiment that shows it.",
      prompts: ["Use Exercise 3: where is the break-even selectivity?", "Clustering versus secondary index", "In SQL Server: set statistics io on; compare logical reads"], where: ["DSC §14.2, §15.3", "Lab 5 part 1"] },
    { t: "cq", code: "CQ8.3", question: "Could a machine-learning model replace an index? What would you need to measure to decide?",
      prompts: ["An index maps a key to a position: what does a model predict?", "Lookup time, accuracy, size, cost of updates", "What guarantees does a B+-tree give that a model does not?"], where: ["Kraska et al., The case for learned index structures, SIGMOD 2018", "DSC §14.3"] },
    { t: "summary", points: [
      "Data is stored in blocks; block transfers dominate the cost",
      "Slotted pages, heap and sequential files, clustering; the buffer manager",
      "Clustering versus secondary, dense versus sparse indices",
      "B+-trees: balanced, high fan-out, logarithmic height",
      "Insertion by splitting; hash indices for equality lookups",
      "An index is not always cheaper than a scan",
    ], next: [
      "Choose one of CQ8.1–CQ8.3 and submit an answer within one week",
      "Self-study: §14.4, §14.6; optional §13.6, §14.8",
      "Read DSC Ch. 15, §15.1–15.4, pp. 689–703 for session 45",
    ] },
  ],
};
