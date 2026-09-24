"""IDB202 – Lab 7 reference solution: algorithms on functional dependencies.

Conventions
-----------
* An attribute is a one-character string or any hashable name.
* A set of attributes is a ``frozenset``.
* An FD X -> Y is a pair ``(frozenset(X), frozenset(Y))``.
* ``parse_fds("AB->C, C->D")`` builds FDs from a compact string when every attribute is one character.
"""
from itertools import combinations


def parse_attrs(text):
    return frozenset(text.replace(" ", "").replace(",", ""))


def parse_fds(text):
    fds = []
    for part in text.split(","):
        part = part.strip()
        if part:
            lhs, rhs = part.split("->")
            fds.append((parse_attrs(lhs), parse_attrs(rhs)))
    return fds


def closure(attrs, fds):
    """Return the closure X+ of ``attrs`` under ``fds``."""
    result = set(attrs)
    changed = True
    while changed:
        changed = False
        for lhs, rhs in fds:
            if lhs <= result and not rhs <= result:
                result |= rhs
                changed = True
    return frozenset(result)


def implies(fds, lhs, rhs):
    """True if ``fds`` logically implies lhs -> rhs."""
    return frozenset(rhs) <= closure(lhs, fds)


def is_superkey(attrs, schema, fds):
    return closure(attrs, fds) >= frozenset(schema)


def candidate_keys(schema, fds):
    """Return every candidate key of ``schema``, sorted by size then name.

    Attributes that never appear on a right-hand side are in every key; attributes that
    appear only on right-hand sides are in no key. The remaining attributes are searched
    by increasing subset size, keeping only minimal superkeys.
    """
    schema = frozenset(schema)
    rhs_all = frozenset().union(*(r for _, r in fds)) if fds else frozenset()
    lhs_all = frozenset().union(*(l for l, _ in fds)) if fds else frozenset()
    core = schema - rhs_all                       # must be in every key
    middle = sorted((schema & lhs_all & rhs_all) - core)
    keys = []
    for size in range(len(middle) + 1):
        for extra in combinations(middle, size):
            cand = core | frozenset(extra)
            if any(k <= cand for k in keys):
                continue                          # not minimal
            if is_superkey(cand, schema, fds):
                keys.append(cand)
    return sorted(keys, key=lambda k: (len(k), sorted(k)))


def prime_attributes(schema, fds):
    return frozenset().union(*candidate_keys(schema, fds))


def minimal_cover(fds):
    """Return a minimal (canonical) cover: single RHS, no extraneous LHS attribute, no redundant FD."""
    # 1. Single attribute on the right.
    g = [(lhs, frozenset([a])) for lhs, rhs in fds for a in rhs]
    # 2. Remove extraneous attributes from the left.
    reduced = []
    for lhs, rhs in g:
        lhs = set(lhs)
        for a in sorted(lhs):
            if len(lhs) > 1 and rhs <= closure(lhs - {a}, g):
                lhs.discard(a)
        reduced.append((frozenset(lhs), rhs))
    # Remove duplicates, keep order.
    seen, g = set(), []
    for fd in reduced:
        if fd not in seen:
            seen.add(fd)
            g.append(fd)
    # 3. Remove redundant FDs.
    i = 0
    while i < len(g):
        rest = g[:i] + g[i + 1:]
        if implies(rest, *g[i]):
            g = rest
        else:
            i += 1
    return g


def project_fds(fds, sub):
    """FDs that hold on the sub-schema ``sub`` (exponential; fine for small schemas)."""
    sub = frozenset(sub)
    out = []
    for size in range(1, len(sub) + 1):
        for lhs in combinations(sorted(sub), size):
            lhs = frozenset(lhs)
            rhs = (closure(lhs, fds) & sub) - lhs
            if rhs:
                out.append((lhs, rhs))
    return minimal_cover(out) if out else []


def is_bcnf(schema, fds):
    schema = frozenset(schema)
    for lhs, rhs in fds:
        if lhs <= schema and not (rhs & schema) <= lhs and not is_superkey(lhs, schema, fds):
            return False
    return True


def is_3nf(schema, fds):
    schema = frozenset(schema)
    prime = prime_attributes(schema, fds)
    for lhs, rhs in minimal_cover(fds):
        if lhs <= schema and rhs <= schema and not rhs <= lhs:
            if not is_superkey(lhs, schema, fds) and not rhs <= prime:
                return False
    return True


def bcnf_decompose(schema, fds):
    """BCNF decomposition. Always lossless; may lose dependencies."""
    result = [frozenset(schema)]
    done = False
    while not done:
        done = True
        for i, r in enumerate(result):
            local = project_fds(fds, r)
            for lhs, rhs in local:
                if not is_superkey(lhs, r, local):
                    y = closure(lhs, local) & r
                    result[i:i + 1] = [y, (r - y) | lhs]
                    done = False
                    break
            if not done:
                break
    return result


def synthesize_3nf(schema, fds):
    """3NF synthesis. Always lossless and dependency-preserving."""
    cover = minimal_cover(fds)
    groups = {}
    for lhs, rhs in cover:
        groups.setdefault(lhs, set()).update(rhs)
    relations = [frozenset(lhs | rhs) for lhs, rhs in groups.items()]
    keys = candidate_keys(schema, fds)
    if not any(k <= r for k in keys for r in relations):
        relations.append(keys[0])
    # Drop relations contained in others.
    relations = [r for r in relations if not any(r < s for s in relations)]
    return list(dict.fromkeys(relations))


def is_lossless(schema, parts, fds):
    """Chase (tableau) test for a decomposition into any number of parts."""
    attrs = sorted(schema)
    rows = [{a: ("a", a) if a in p else ("b", i, a) for a in attrs} for i, p in enumerate(parts)]
    changed = True
    while changed:
        changed = False
        for lhs, rhs in fds:
            for i in range(len(rows)):
                for j in range(i + 1, len(rows)):
                    if all(rows[i][a] == rows[j][a] for a in lhs):
                        for a in rhs:
                            x, y = rows[i][a], rows[j][a]
                            if x != y:
                                keep = x if x[0] == "a" else y if y[0] == "a" else min(x, y)
                                drop = y if keep == x else x
                                for row in rows:
                                    if row[a] == drop:
                                        row[a] = keep
                                changed = True
    return any(all(row[a][0] == "a" for a in attrs) for row in rows)


def preserves_dependencies(parts, fds):
    projected = [fd for p in parts for fd in project_fds(fds, p)]
    return all(implies(projected, lhs, rhs) for lhs, rhs in fds)


def fmt(attrs):
    return "".join(sorted(attrs))


def fmt_fds(fds):
    return ", ".join(f"{fmt(l)}->{fmt(r)}" for l, r in fds)
