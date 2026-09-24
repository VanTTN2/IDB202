"""Tests for Lab 7 (fd.py). Run from the labs/python folder:  python -m pytest tests"""
from fd import (parse_attrs as A, parse_fds as F, closure, candidate_keys, minimal_cover,
                is_bcnf, is_3nf, bcnf_decompose, synthesize_3nf, is_lossless,
                preserves_dependencies, implies)


def test_closure():
    fds = F("A->B, B->C, CD->E")
    assert closure(A("A"), fds) == A("ABC")
    assert closure(A("AD"), fds) == A("ABCDE")


def test_candidate_keys_single():
    assert candidate_keys(A("ABCDE"), F("A->B, B->C, CD->E")) == [A("AD")]


def test_candidate_keys_multiple():
    keys = candidate_keys(A("ABCD"), F("AB->C, C->D, D->A"))
    assert set(keys) == {A("AB"), A("BC"), A("BD")}


def test_minimal_cover_is_equivalent_and_minimal():
    fds = F("A->BC, B->C, A->B, AB->C")
    cover = minimal_cover(fds)
    assert set(cover) == set(F("A->B, B->C"))
    for lhs, rhs in fds:
        assert implies(cover, lhs, rhs)


def test_normal_forms():
    assert not is_3nf(A("ABCD"), F("A->B, B->C, C->D"))          # transitive
    assert is_3nf(A("ABC"), F("AB->C, C->B"))                     # 3NF ...
    assert not is_bcnf(A("ABC"), F("AB->C, C->B"))                # ... but not BCNF
    assert is_bcnf(A("AB"), F("A->B"))


def test_bcnf_decomposition_is_lossless_and_bcnf():
    schema, fds = A("ABC"), F("AB->C, C->B")
    parts = bcnf_decompose(schema, fds)
    assert is_lossless(schema, parts, fds)
    assert not preserves_dependencies(parts, fds)                 # AB->C is lost


def test_3nf_synthesis_properties():
    schema = A("SCTIRN")   # Student, Course, Term, Instructor, Room, iName
    fds = F("SCT->I, I->N, CT->R")
    parts = synthesize_3nf(schema, fds)
    assert is_lossless(schema, parts, fds)
    assert preserves_dependencies(parts, fds)
    assert set(parts) == {A("SCTI"), A("IN"), A("CTR")}


def test_lossless_binary():
    assert is_lossless(A("ABC"), [A("AB"), A("BC")], F("B->C"))
    assert not is_lossless(A("ABC"), [A("AB"), A("BC")], F("A->B"))
