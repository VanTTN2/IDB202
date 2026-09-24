"""IDB202 – Lab 8 reference solution: schedules and serializability.

A schedule is written as a string of operations separated by spaces, e.g.
    "r1(A) w1(A) r2(A) w2(A) c1 c2"
Operations: r<i>(X) read, w<i>(X) write, c<i> commit, a<i> abort.
"""
import re

_OP = re.compile(r"^([rwca])(\d+)(?:\((\w+)\))?$")


def parse(schedule):
    ops = []
    for token in schedule.split():
        m = _OP.match(token)
        if not m:
            raise ValueError(f"bad operation: {token}")
        kind, tx, item = m.group(1), int(m.group(2)), m.group(3)
        if (kind in "rw") != (item is not None):
            raise ValueError(f"bad operation: {token}")
        ops.append((kind, tx, item))
    return ops


def transactions(ops):
    return sorted({tx for _, tx, _ in ops})


def conflicts(op1, op2):
    k1, t1, x1 = op1
    k2, t2, x2 = op2
    return t1 != t2 and x1 is not None and x1 == x2 and "w" in (k1, k2)


def precedence_graph(ops):
    """Return {Ti: set of Tj} with an edge Ti -> Tj for each conflicting pair (Ti's op first)."""
    graph = {t: set() for t in transactions(ops)}
    for i, a in enumerate(ops):
        for b in ops[i + 1:]:
            if conflicts(a, b):
                graph[a[1]].add(b[1])
    return graph


def topological_order(graph):
    """Return one topological order of the graph, or None if it has a cycle (Kahn's algorithm)."""
    indeg = {v: 0 for v in graph}
    for v in graph:
        for w in graph[v]:
            indeg[w] += 1
    ready = sorted(v for v, d in indeg.items() if d == 0)
    order = []
    while ready:
        v = ready.pop(0)
        order.append(v)
        for w in sorted(graph[v]):
            indeg[w] -= 1
            if indeg[w] == 0:
                ready.append(w)
        ready.sort()
    return order if len(order) == len(graph) else None


def is_conflict_serializable(schedule):
    return topological_order(precedence_graph(parse(schedule))) is not None


def equivalent_serial_order(schedule):
    return topological_order(precedence_graph(parse(schedule)))


def reads_from(ops):
    """List of (reader, item, writer) where writer is None for the initial value."""
    last_writer, out = {}, []
    for kind, tx, item in ops:
        if kind == "w":
            last_writer[item] = tx
        elif kind == "r":
            w = last_writer.get(item)
            out.append((tx, item, w if w != tx else None) if w != tx else (tx, item, None))
    return [(r, x, w) for r, x, w in out if w is not None]


def _end_positions(ops):
    ends = {}
    for pos, (kind, tx, _) in enumerate(ops):
        if kind in "ca":
            ends[tx] = (kind, pos)
    return ends


def is_recoverable(schedule):
    """If Tj reads from Ti, then Ti must commit before Tj commits."""
    ops = parse(schedule)
    ends = _end_positions(ops)
    for reader, _, writer in reads_from(ops):
        r_end = ends.get(reader)
        if r_end and r_end[0] == "c":
            w_end = ends.get(writer)
            if not w_end or w_end[0] != "c" or w_end[1] > r_end[1]:
                return False
    return True


def is_cascadeless(schedule):
    """Every read reads a value written by an already committed transaction (or its own)."""
    ops = parse(schedule)
    committed, last_writer = set(), {}
    for kind, tx, item in ops:
        if kind == "c":
            committed.add(tx)
        elif kind == "w":
            last_writer[item] = tx
        elif kind == "r":
            w = last_writer.get(item)
            if w is not None and w != tx and w not in committed:
                return False
    return True
