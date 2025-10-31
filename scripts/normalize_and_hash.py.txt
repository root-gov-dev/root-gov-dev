#!/usr/bin/env python3
import sys, os, json, hashlib
from pathlib import Path

def to_bytes(s): return s.encode('utf-8')

def sha3_512(data: bytes)->str:
    return hashlib.sha3_512(data).hexdigest()

try:
    import blake3
    def b3(data: bytes)->str: return blake3.blake3(data).hexdigest()
except Exception:
    def b3(data: bytes)->str: return hashlib.sha256(data).hexdigest()  # fallback

def canonicalize_text(s:str)->str:
    # 規範化：LF、去 BOM、去尾空白、確保結尾單一換行
    s = s.replace('\r\n','\n').replace('\r','\n')
    if s.startswith('\ufeff'): s = s[1:]
    lines = [ln.rstrip() for ln in s.split('\n')]
    return '\n'.join(lines).rstrip('\n') + '\n'

def is_text(p:Path)->bool:
    # 雙副檔名 .*.txt 一律視為 text
    return p.name.endswith('.txt')

def process_file(p:Path):
    content = p.read_text(encoding='utf-8', errors='ignore') if is_text(p) else None
    if content is None:
        with open(p,'rb') as f: data = f.read()
        return {
            "path": str(p),
            "type": "binary",
            "sha3_512": sha3_512(data),
            "blake3": b3(data)
        }
    canon = canonicalize_text(content)
    data = to_bytes(canon)
    return {
        "path": str(p),
        "type": "text",
        "size": len(data),
        "sha3_512": sha3_512(data),
        "blake3": b3(data)
    }

def walk(root:str):
    out=[]
    for dirpath,_,files in os.walk(root):
        for fn in sorted(files):
            p=Path(dirpath)/fn
            if '.git' in p.parts or p.name.endswith('.lock') or p.name.endswith('.sig'): 
                continue
            out.append(process_file(p))
    return out

def main():
    root = sys.argv[1] if len(sys.argv)>1 else '.'
    files = walk(root)
    aggregate = sha3_512(to_bytes(json.dumps(files, sort_keys=True, ensure_ascii=False)))
    report = {
        "root": os.path.abspath(root),
        "files": files,
        "aggregate_sha3_512": aggregate
    }
    Path('output').mkdir(exist_ok=True, parents=True)
    with open('output/hashlock.json','w',encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print(aggregate)

if __name__ == "__main__":
    main()