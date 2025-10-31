#!/usr/bin/env python3
import json, sys, hashlib

def load(path):
    with open(path,'r',encoding='utf-8') as f: return json.load(f)

def main():
    base = sys.argv[1]
    current = sys.argv[2]
    b = load(base); c = load(current)
    bmap = {x["path"]: x["sha3_512"] for x in b["files"]}
    cmap = {x["path"]: x["sha3_512"] for x in c["files"]}
    added = sorted(set(cmap) - set(bmap))
    removed = sorted(set(bmap) - set(cmap))
    changed = sorted([p for p in set(cmap) & set(bmap) if cmap[p] != bmap[p]])
    report = {"added": added, "removed": removed, "changed": changed}
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if changed or added or removed:
        sys.exit(2)

if __name__ == "__main__":
    if len(sys.argv)<3:
        print("usage: detect_drift.py base_hashlock.json current_hashlock.json")
        sys.exit(1)
    main()