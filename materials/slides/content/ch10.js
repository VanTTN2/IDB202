// Chapter 10 – Transactions, concurrency control and recovery (sessions 49, 50, 51, 53, 55)
module.exports = {
  num: 10,
  title: "Transactions, concurrency control and recovery",
  short: "Transactions",
  sessions: [49, 50, 51, 53, 55],
  reading: "DSC Ch. 17, §17.1–17.10; Ch. 18, §18.1–18.2, §18.4, §18.8; Ch. 19, §19.1, §19.3–19.4",
  slides: [
    { t: "outline", title: "Chapter 10 roadmap", items: [
      { session: "49–50", head: "Transactions", points: ["17.1–17.4 Concept, model, storage, atomicity", "17.10 Transactions in SQL", "17.5–17.6 Isolation, serializability"] },
      { session: "51", head: "Schedules and locking", points: ["17.7 Recoverable, cascadeless", "17.8–17.9 Isolation levels", "18.1 Two-phase locking"] },
      { session: "53", head: "Concurrency in practice", points: ["18.2 Deadlocks", "18.4 Phantoms", "18.8 Snapshot isolation"] },
      { session: "55", head: "Recovery", points: ["19.1 Failures", "19.3 Write-ahead logging", "19.4 Recovery algorithm", "CQ10.1–CQ10.3"] },
    ] },

    // ---------------- Session 49 ----------------
    { t: "session", n: 49, title: "Transaction concept, a simple transaction model, storage structure, atomicity and durability; transactions as SQL statements", reading: "DSC Ch. 17, §17.1–17.4, pp. 799–806; §17.10" },
    { t: "cards", title: "17.1 The ACID properties", lead: "A transaction is a unit of program execution that accesses and possibly updates data items.", items: [
      { head: "Atomicity", body: "Either all operations of the transaction are reflected in the database, or none are." },
      { head: "Consistency", body: "Executed in isolation, a transaction preserves the consistency of the database." },
      { head: "Isolation", body: "Each transaction is unaware of other transactions executing concurrently." },
      { head: "Durability", body: "After a transaction completes successfully, its changes persist, even if the system fails." },
    ] },
    { t: "code", title: "17.2 A simple transaction model", side: "Reasoning with the model", code:
"-- Ti transfers 50 from account A to account B\nTi:  read(A);\n     A := A - 50;\n     write(A);\n     read(B);\n     B := B + 50;\n     write(B).",
      bullets: ["read(X) copies X from the database into a local buffer; write(X) copies it back", "Consistency: A + B is unchanged by the transaction", "Atomicity: a failure after write(A) but before write(B) must not leave the change to A", "Durability: once the user is told the transfer is done, it must survive a crash", "Isolation: another transaction must not see A already debited but B not yet credited"] },
    { t: "twocol", title: "17.3–17.4 Storage and transaction states", left: { head: "Storage types", items: [
      "Volatile: main memory, cache; lost in a crash",
      "Non-volatile: disk, flash; survives crashes, may fail",
      "Stable: never lost (an idealization, approximated by replication); the log is kept here",
    ] }, right: { head: "Transaction states", items: [
      "Active → partially committed (last statement executed) → committed",
      "Active or partially committed → failed → aborted (rolled back)",
      "After an abort, the system can restart the transaction or kill it",
      "Observable external writes (e.g. printing a ticket) are delayed until commit",
    ] } },
    { t: "code", title: "17.10 Transactions as SQL statements", side: "Notes", code:
"-- SQL Server: autocommit unless a transaction is started\nbegin transaction;\n    update account set balance = balance - 50\n    where  account_id = 'A';\n    update account set balance = balance + 50\n    where  account_id = 'B';\ncommit transaction;     -- or: rollback transaction;\n\n-- standard SQL: commit work / rollback work",
      bullets: ["By default, many systems commit each SQL statement as its own transaction", "A transaction groups statements into one atomic unit", "A transaction can read with a predicate (where clause): the phantom problem of §18.4 comes from such reads", "Error handling inside procedures: Chapter 5 (TRY…CATCH)"] },

    // ---------------- Session 50 ----------------
    { t: "session", n: 50, title: "Transaction isolation; serializability: conflict serializability and precedence graphs", reading: "DSC Ch. 17, §17.5–17.6, pp. 807–818" },
    { t: "bullets", title: "17.5 Transaction isolation", bullets: [
      "Concurrent execution improves throughput and resource utilization, and reduces waiting time",
      "A schedule is a sequence of the instructions of a set of transactions, preserving the order within each transaction",
      { b: "Serial schedule:", t: "the transactions run one after another; always consistent if each transaction is" },
      "Concurrent schedules can leave the database inconsistent, e.g. a lost update",
      "The concurrency-control component of the DBMS must allow only schedules that are equivalent to some serial schedule",
    ] },
    { t: "twocol", title: "17.6 Conflict serializability", left: { head: "Conflicting instructions", items: [
      "Instructions of Ti and Tj conflict if they access the same item Q and at least one of them is write(Q)",
      "read–read does not conflict; read–write, write–read and write–write do",
      "Swapping adjacent non-conflicting instructions gives a conflict-equivalent schedule",
    ] }, right: { head: "Definition", items: [
      "A schedule is conflict serializable if it is conflict equivalent to a serial schedule",
      "View serializability is a weaker condition; testing it is NP-complete, so systems use conflict serializability",
    ] } },
    { t: "code", title: "Precedence graphs", side: "Test", code:
"-- schedule S (time goes down)\n T1             T2\n read(A)\n                read(A)\n write(A)\n                write(A)\n\n-- edges\n T1 -> T2   (T1 reads A before T2 writes A)\n T2 -> T1   (T2 reads A before T1 writes A)\n-- cycle: S is not conflict serializable",
      bullets: ["Vertices: the transactions; edge Ti → Tj if an instruction of Ti conflicts with a later instruction of Tj", "S is conflict serializable iff its precedence graph is acyclic", "A topological order of an acyclic graph gives an equivalent serial order", "The example is a lost update: T1's write is overwritten", "Lab 5 part 2 builds precedence graphs from observed schedules"] },

    // ---------------- Session 51 ----------------
    { t: "session", n: 51, title: "Recoverable and cascadeless schedules; isolation levels and their implementation; two-phase locking", reading: "DSC Ch. 17, §17.7–17.9, pp. 819–827; Ch. 18, §18.1, pp. 835–848 · Self-study: §18.3 Multiple granularity, pp. 853–856" },
    { t: "twocol", title: "17.7 Recoverable and cascadeless schedules", left: { head: "Recoverable", items: [
      "If Tj reads a data item written by Ti, then Ti commits before Tj commits",
      "Otherwise, if Ti aborts after Tj committed, Tj's effect cannot be undone",
    ] }, right: { head: "Cascadeless", items: [
      "If Tj reads a data item written by Ti, then Ti commits before Tj reads it",
      "Avoids cascading rollback: one abort forcing many others",
      "Every cascadeless schedule is recoverable",
    ] } },
    { t: "table", title: "17.8 Isolation levels in SQL", colW: [3.4, 2.8, 3.0, 3.1], head: ["Level", "Dirty read", "Non-repeatable read", "Phantom"], rows: [
      ["Read uncommitted", "possible", "possible", "possible"],
      ["Read committed", "not possible", "possible", "possible"],
      ["Repeatable read", "not possible", "not possible", "possible"],
      ["Serializable", "not possible", "not possible", "not possible"],
    ], caption: "All levels forbid dirty writes. SQL Server also offers snapshot isolation; its default is read committed. 17.9: levels are implemented by locking, timestamps or multiple versions." },
    { t: "bullets", title: "18.1 Lock-based protocols: two-phase locking", bullets: [
      { b: "Lock modes:", t: "shared (S) for reading, exclusive (X) for writing; S is compatible only with S" },
      { b: "Two-phase locking (2PL):", t: "growing phase (obtain locks, release none), then shrinking phase (release locks, obtain none)" },
      { b: "Lock point:", t: "the moment a transaction obtains its last lock" },
      "2PL ensures conflict serializability: order the transactions by their lock points",
      { b: "Strict 2PL:", t: "exclusive locks are held until commit or abort, which makes schedules cascadeless" },
      { b: "Rigorous 2PL:", t: "all locks are held until commit or abort" },
      "2PL does not prevent deadlocks",
    ], card: { head: "Link to CQ10.2", body: "Why does two-phase locking guarantee serializability? Explain the idea of the lock point." } },

    // ---------------- Session 53 ----------------
    { t: "session", n: 53, title: "Deadlock handling; insert, delete and predicate reads (phantoms); snapshot isolation (overview)", reading: "DSC Ch. 18, §18.2, pp. 849–852; §18.4, pp. 857–860; §18.8, pp. 872–879 · Self-study: §18.5, pp. 861–865; §18.7, pp. 869–871; §18.9, pp. 880–882" },
    { t: "twocol", title: "18.2 Deadlock handling", left: { head: "Prevention", items: [
      "Order the data items and lock them in that order, or lock everything at the start",
      "Wait-die and wound-wait: use timestamps to decide who waits and who rolls back",
      "Lock timeouts: roll back a transaction that waits too long",
    ] }, right: { head: "Detection and recovery", items: [
      "Wait-for graph: edge Ti → Tj if Ti waits for a lock held by Tj",
      "A deadlock exists iff the graph has a cycle",
      "Choose a victim (minimum cost), roll it back (totally or partially), avoid starvation",
      "SQL Server detects deadlocks and rolls back a victim with error 1205",
    ] } },
    { t: "bullets", title: "18.4 Phantoms: insert, delete and predicate reads", bullets: [
      "T1: select count(*) from instructor where dept_name = 'Physics'",
      "T2: insert into instructor values ('11111', 'Feynman', 'Physics', 94000)",
      "T1 and T2 conflict on a tuple T1 never read: the phantom phenomenon",
      "Locking only the tuples that were read is not enough; the predicate must be protected",
      "Index-locking protocol: lock the index leaf nodes that the predicate covers (in SQL Server: key-range locks at the serializable level)",
    ], notes: "The example follows the instructor/Physics phantom discussion in DSC §17.10 and §18.4." },
    { t: "bullets", title: "18.8 Snapshot isolation (overview)", bullets: [
      "Each transaction reads from a snapshot of the committed data as of its start; reads never wait",
      "Writes are kept private until commit",
      "First-committer-wins (or first-updater-wins): of two concurrent transactions updating the same item, only one may commit",
      "Snapshot isolation is not serializable: write skew is possible",
      { t: "Example: two concurrent transactions each check a constraint over two items and each update a different item; both commit, the constraint is violated", sub: true },
      "SQL Server: set transaction isolation level snapshot (after allow_snapshot_isolation is enabled for the database)",
    ] },

    // ---------------- Session 55 ----------------
    { t: "session", n: 55, title: "Recovery system (overview): failure classification, recovery and atomicity (write-ahead logging), recovery algorithm (main ideas)", reading: "DSC Ch. 19, §19.1, §19.3, pp. 907, 912–921 · Self-study: §19.2, pp. 908–911; §19.4, pp. 922–925; §19.5–19.6, pp. 926–930; optional §19.9 ARIES, pp. 941–946" },
    { t: "cards", title: "19.1 Failure classification", items: [
      { head: "Transaction failure", body: "Logical error (bad input, overflow) or system error (e.g. deadlock): the transaction cannot continue." },
      { head: "System crash", body: "Hardware or software failure loses volatile storage; non-volatile storage is assumed intact (fail-stop)." },
      { head: "Disk failure", body: "A head crash or similar destroys part of non-volatile storage; recovery uses archived copies." },
    ] },
    { t: "code", title: "19.3 Log records and write-ahead logging", side: "Rules", code:
"<Ti start>\n<Ti, Xj, V1, V2>   -- Ti wrote Xj: old value V1, new value V2\n<Ti commit>\n<Ti abort>\n\n-- example: Ti transfers 50 from A (1000) to B (2000)\n<Ti start>\n<Ti, A, 1000, 950>\n<Ti, B, 2000, 2050>\n<Ti commit>",
      bullets: ["Write-ahead logging (WAL): a log record must reach stable storage before the data block it describes is written to disk", "Ti commits when its commit record reaches stable storage", "undo(Ti) restores old values; redo(Ti) reapplies new values", "Checkpoints <checkpoint L> limit how much of the log must be scanned"] },
    { t: "twocol", title: "19.4 Recovery algorithm (main ideas)", left: { head: "Redo phase", items: [
      "Scan the log forward from the last checkpoint",
      "Repeat history: redo every update record, including those of incomplete transactions",
      "Build the undo-list: transactions started but neither committed nor aborted",
    ] }, right: { head: "Undo phase", items: [
      "Scan the log backward, undoing the updates of transactions in the undo-list",
      "Each undo writes a redo-only log record, so recovery itself is restartable",
      "When <Ti start> is reached, write <Ti abort>; stop when the undo-list is empty",
    ] }, notes: "Briefing for the self-study of Chapter 19: §19.2, §19.4 in full, §19.5–19.6; ARIES (§19.9) is optional." },
    { t: "cq", code: "CQ10.1", question: "Why is serializability the accepted correctness criterion for concurrent transactions? What weaker criteria do real systems use, and why?",
      prompts: ["What does a serial schedule guarantee if each transaction is correct?", "Which isolation level is the default in SQL Server?", "What anomalies do weaker levels allow?"], where: ["DSC §17.5–17.8, §18.9 (self-study)", "Berenson et al., A critique of ANSI SQL isolation levels, SIGMOD 1995"] },
    { t: "cq", code: "CQ10.2", question: "Why does two-phase locking guarantee serializability? Explain the idea of the lock point.",
      prompts: ["Order the transactions by their lock points", "Suppose the precedence graph had a cycle: what would it say about lock points?", "Why is 2PL sufficient but not necessary?"], where: ["DSC §18.1", "Eswaran et al., The notions of consistency and predicate locks in a database system, CACM 1976"] },
    { t: "cq", code: "CQ10.3", question: "Why must a log record reach stable storage before the data page it describes (write-ahead logging)?",
      prompts: ["Crash after the data page is written but before the log record", "What can undo do without the old value?", "Relate to steal / no-force buffer policies (§19.5)"], where: ["DSC §19.3; self-study §19.5", "Optional: Mohan et al., ARIES, ACM TODS 1992"] },
    { t: "summary", points: [
      "ACID; the read/write transaction model; transaction states",
      "Conflict serializability tested with precedence graphs",
      "Recoverable and cascadeless schedules; SQL isolation levels",
      "Two-phase locking and the lock point; strict 2PL",
      "Deadlocks, phantoms and snapshot isolation",
      "Write-ahead logging; redo and undo phases of recovery",
    ], next: [
      "Choose one of CQ10.1–CQ10.3 and submit an answer within one week",
      "Self-study: §18.3, §18.5, §18.7, §18.9; Chapter 19 sections listed above",
      "Sessions 56–57: project presentations; 58–59: course review",
    ] },
  ],
};
