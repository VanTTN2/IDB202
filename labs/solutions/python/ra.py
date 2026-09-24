"""IDB201 – Lab 3 reference solution: a tiny relational algebra evaluator.

A relation is a pair (schema, rows):
* ``schema`` is a tuple of attribute names, e.g. ("StudentID", "Name");
* ``rows`` is a frozenset of tuples. Because it is a set, duplicates cannot occur (set semantics).
"""


class Relation:
    def __init__(self, schema, rows):
        self.schema = tuple(schema)
        self.rows = frozenset(tuple(r) for r in rows)
        if len(set(self.schema)) != len(self.schema):
            raise ValueError("duplicate attribute names")
        for r in self.rows:
            if len(r) != len(self.schema):
                raise ValueError(f"row {r} does not match schema {self.schema}")

    def __eq__(self, other):
        if set(self.schema) != set(other.schema):
            return False
        order = [other.schema.index(a) for a in self.schema]
        return self.rows == frozenset(tuple(r[i] for i in order) for r in other.rows)

    def __len__(self):
        return len(self.rows)

    def dicts(self):
        return [dict(zip(self.schema, r)) for r in self.rows]

    def __repr__(self):
        lines = [" | ".join(self.schema)]
        lines += [" | ".join(map(str, r)) for r in sorted(self.rows, key=str)]
        return "\n".join(lines)


def select(rel, predicate):
    """sigma: ``predicate`` receives a dict {attribute: value}."""
    return Relation(rel.schema, (r for r in rel.rows if predicate(dict(zip(rel.schema, r)))))


def project(rel, attrs):
    """pi: keeps ``attrs`` and removes duplicates."""
    idx = [rel.schema.index(a) for a in attrs]
    return Relation(attrs, (tuple(r[i] for i in idx) for r in rel.rows))


def rename(rel, mapping):
    """rho: ``mapping`` is {old_name: new_name}."""
    return Relation([mapping.get(a, a) for a in rel.schema], rel.rows)


def _check_compatible(r, s):
    if len(r.schema) != len(s.schema):
        raise ValueError("relations are not union-compatible")


def union(r, s):
    _check_compatible(r, s)
    return Relation(r.schema, r.rows | s.rows)


def intersection(r, s):
    _check_compatible(r, s)
    return Relation(r.schema, r.rows & s.rows)


def difference(r, s):
    _check_compatible(r, s)
    return Relation(r.schema, r.rows - s.rows)


def product(r, s):
    if set(r.schema) & set(s.schema):
        raise ValueError("rename common attributes before a Cartesian product")
    return Relation(r.schema + s.schema, (a + b for a in r.rows for b in s.rows))


def theta_join(r, s, predicate):
    return select(product(r, s), predicate)


def natural_join(r, s):
    common = [a for a in r.schema if a in s.schema]
    extra = [a for a in s.schema if a not in common]
    ri = [r.schema.index(a) for a in common]
    si = [s.schema.index(a) for a in common]
    ei = [s.schema.index(a) for a in extra]
    # Hash join: build on s, probe with r.
    table = {}
    for t in s.rows:
        table.setdefault(tuple(t[i] for i in si), []).append(t)
    out = []
    for t in r.rows:
        for u in table.get(tuple(t[i] for i in ri), []):
            out.append(t + tuple(u[i] for i in ei))
    return Relation(r.schema + tuple(extra), out)


def divide(r, s):
    """R(Z) / S(X) with X subset of Z: the Y = Z - X values paired with every tuple of S."""
    y = [a for a in r.schema if a not in s.schema]
    candidates = project(r, y)
    missing = difference(product(candidates, s) if s.rows else candidates,
                         project(r, y + list(s.schema)) if s.rows else candidates)
    if not s.rows:
        return candidates
    return difference(candidates, project(missing, y))
