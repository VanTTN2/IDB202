"""Tests for Lab 3 (ra.py) and Lab 8 (schedule.py). Run from labs/python:  python -m pytest tests"""
from ra import Relation, select, project, rename, union, difference, natural_join, divide, product
from schedule import (is_conflict_serializable, equivalent_serial_order, is_recoverable,
                      is_cascadeless, precedence_graph, parse)

STUDENT = Relation(("SID", "Dept"), [("s1", "CS"), ("s2", "SE"), ("s3", "CS")])
ENROLL = Relation(("SID", "Sec"), [("s1", 1), ("s1", 2), ("s2", 1), ("s3", 2)])
FA = Relation(("Sec",), [(1,), (2,)])


def test_select_project():
    cs = select(STUDENT, lambda t: t["Dept"] == "CS")
    assert len(cs) == 2
    assert project(STUDENT, ("Dept",)) == Relation(("Dept",), [("CS",), ("SE",)])


def test_union_difference():
    a = project(select(ENROLL, lambda t: t["Sec"] == 1), ("SID",))
    b = project(select(ENROLL, lambda t: t["Sec"] == 2), ("SID",))
    assert union(a, b) == project(ENROLL, ("SID",))
    assert difference(a, b) == Relation(("SID",), [("s2",)])


def test_natural_join_and_product():
    j = natural_join(STUDENT, ENROLL)
    assert len(j) == 4 and set(j.schema) == {"SID", "Dept", "Sec"}
    p = product(STUDENT, rename(ENROLL, {"SID": "SID2"}))
    assert len(p) == len(STUDENT) * len(ENROLL)


def test_divide():
    assert divide(ENROLL, FA) == Relation(("SID",), [("s1",)])


def test_serializability():
    assert not is_conflict_serializable("r1(A) r2(A) w1(A) w2(A) c1 c2")      # lost update
    assert is_conflict_serializable("r1(A) w1(A) r2(A) w2(A) c1 c2")
    assert equivalent_serial_order("r2(B) r1(A) w2(A) c1 c2") == [1, 2]
    assert precedence_graph(parse("r1(X) r2(Y) w1(Y) w2(X)")) == {1: {2}, 2: {1}}


def test_recoverability():
    assert not is_recoverable("w1(A) r2(A) c2 a1")
    assert is_recoverable("w1(A) r2(A) c1 c2")
    assert not is_cascadeless("w1(A) r2(A) c1 c2")
    assert is_cascadeless("w1(A) c1 r2(A) c2")
