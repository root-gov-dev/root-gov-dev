#!/usr/bin/env python3
"""
Purpose: Deterministic tool installer with evidence chain.
- Reads tools/required-inputs.yaml to discover pinned versions and official checksum URLs (SoT).
- Downloads binaries/tarballs, verifies integrity against the official checksums file (no fabricated hashes).
- Extracts and installs into ./bin (created if missing), updates PATH instructions via stdout.
- Emits JSON evidence with SHA3-512 and BLAKE3 for installed artifacts.

Usage:
  python3 scripts/install_tools.py --tools opa,conftest,syft,trivy,cosign,kyverno,kubescape,kube-bench,kubectl
Options:
  --inputs tools/required-inputs.yaml
  --out artifacts/tools/install-report.json

Notes:
- This installer prefers verification by matching the computed SHA256 with the upstream checksums document for the exact version.
- If vendor provides single-file .sha256 (e.g., kubectl), verify exact equality.
- For tar.gz/zip, verify the archive then extract target binary by configured subpath or heuristic.
- On any verification mismatch, the installer fails fast.

File-level comments are kept concise and updated with code changes.
"""

import argparse, json, os, sys, hashlib, shutil, tarfile, zipfile, tempfile, subprocess, re
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError

try:
    import yaml  # PyYAML is available on GitHub-hosted runners
except Exception as e:
    print("FATAL: PyYAML not available; please ensure 'python3 -m pip install pyyaml' before running.", file=sys.stderr)
    sys.exit(2)

# ---------- Helpers ----------

def sha256_of(path: str) -> str:
    """Compute SHA256 of a file."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()

def sha3_512_of(path: str) -> str:
    """Compute SHA3-512 of a file."""
    h = hashlib.sha3_512()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()

def blake3_of(path: str) -> str:
    """Compute BLAKE3 of a file if module exists; fallback to empty string."""
    try:
        import blake3  # type: ignore
        h = blake3.blake3()
        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                h.update(chunk)
        return h.hexdigest()
    except Exception:
        return ""

def http_get(url: str, dest: str, retries: int = 3) -> None:
    """Download a URL to dest with retry."""
    last_err = None
    for i in range(retries):
        try:
            req = Request(url, headers={"User-Agent": "tools-installer/1.0"})
            with urlopen(req, timeout=60) as resp, open(dest, "wb") as out:
                shutil.copyfileobj(resp, out)
            return
        except (URLError, HTTPError) as e:
            last_err = e
            print(f"retry {i+1}/{retries} for {url}: {e}", file=sys.stderr)
    if last_err:
        raise last_err

def ensure_dir(p: str) -> None:
    """Ensure directory exists."""
    os.makedirs(p, exist_ok=True)

def is_executable(path: str) -> bool:
    """Check if path is executable file."""
    return os.path.isfile(path) and os.access(path, os.X_OK)

# ---------- Core ----------

def parse_args():
    """Parse CLI arguments."""
    ap = argparse.ArgumentParser()
    ap.add_argument("--tools", required=True, help="Comma-separated tool names matching required-inputs.yaml")
    ap.add_argument("--inputs", default="tools/required-inputs.yaml")
    ap.add_argument("--out", default="artifacts/tools/install-report.json")
    ap.add_argument("--bin-dir", default="bin")
    return ap.parse_args()

def load_inputs(path: str) -> dict:
    """Load YAML required inputs."""
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

def verify_with_checksums_file(binary_path: str, checksums_path: str, expected_filename: str = None) -> bool:
    """
    Verify the binary/archive at binary_path against the official checksums file content.
    Accept common formats:
      - '<sha256>  <filename>'
      - 'SHA256 (filename) = <sha256>'
      - file with only one line hash (kubectl style)
    """
    file_hash = sha256_of(binary_path)
    content = open(checksums_path, "r", encoding="utf-8", errors="ignore").read()

    # kubectl style: checksum file contains only the hash
    single = content.strip()
    if re.fullmatch(r"[a-fA-F0-9]{64}", single):
        ok = (single.lower() == file_hash.lower())
        print(f"verify single-hash: computed={file_hash} expected={single} ok={ok}")
        return ok

    # grep hex hash in file, optionally match filename
    lines = [l.strip() for l in content.splitlines() if l.strip()]
    for ln in lines:
        # format 1: '<hash>  filename'
        m1 = re.match(r"^([a-fA-F0-9]{64})\s+\*?(.+)$", ln)
        if m1:
            h, fn = m1.group(1), m1.group(2)
            if expected_filename and expected_filename not in fn:
                # try next line
                pass
            else:
                if h.lower() == file_hash.lower():
                    return True
        # format 2: 'SHA256 (filename) = hash'
        m2 = re.match(r"^SHA256\s*\((.+)\)\s*=\s*([a-fA-F0-9]{64})$", ln)
        if m2:
            fn, h = m2.group(1), m2.group(2)
            if expected_filename and expected_filename not in fn:
                pass
            else:
                if h.lower() == file_hash.lower():
                    return True
    return False

def extract_archive(archive_path: str, member_hint: str = None, out_dir: str = ".") -> str:
    """
    Extract a tar.gz or zip archive and return path to resolved binary.
    member_hint may be the expected binary name (e.g., 'conftest' or 'syft').
    """
    if tarfile.is_tarfile(archive_path):
        with tarfile.open(archive_path, "r:*") as tf:
            members = tf.getmembers()
            candidate = None
            for m in members:
                base = os.path.basename(m.name)
                if member_hint and base == member_hint:
                    candidate = m
                    break
                if not member_hint and (base in ("syft", "trivy", "conftest", "kyverno", "kube-bench")):
                    candidate = m
                    break
            if candidate is None:
                # fallback: first executable-like file
                for m in members:
                    base = os.path.basename(m.name)
                    if base and "." not in base:
                        candidate = m
                        break
            if candidate is None:
                raise RuntimeError("no candidate binary found in archive")
            tf.extract(candidate, path=out_dir)
            return os.path.join(out_dir, candidate.name)
    elif zipfile.is_zipfile(archive_path):
        with zipfile.ZipFile(archive_path) as zf:
            members = zf.infolist()
            candidate = None
            for m in members:
                base = os.path.basename(m.filename)
                if member_hint and base == member_hint:
                    candidate = m
                    break
                if not member_hint and (base in ("syft", "trivy", "conftest", "kyverno", "kube-bench")):
                    candidate = m
                    break
            if candidate is None:
                for m in members:
                    base = os.path.basename(m.filename)
                    if base and "." not in base:
                        candidate = m
                        break
            if candidate is None:
                raise RuntimeError("no candidate binary found in zip")
            zf.extract(candidate, path=out_dir)
            return os.path.join(out_dir, candidate.filename)
    else:
        raise RuntimeError("unsupported archive format")

def install_tool(tool: dict, bin_dir: str, tmpdir: str) -> dict:
    """
    Install a single tool given its config record.
    Returns an evidence record including hashes and resolved path.
    """
    name = tool["name"]
    version = tool["version"]
    urls = tool["urls"]  # {"binary": "...", "checksums": "..."}; may be "archive" key instead of "binary"
    kind = tool.get("kind", "binary")  # "binary" | "archive"
    expected_filename = tool.get("expected_filename")  # used for checksum matching
    member_hint = tool.get("member_hint")  # for archive extraction
    target_name = tool.get("target_name", name)

    # Fetch artifact(s)
    ensure_dir(tmpdir)
    ensure_dir(bin_dir)
    art_path = os.path.join(tmpdir, f"{name}-{version}")
    if kind == "archive":
        art_path += ".tar.gz" if urls.get("archive", "").endswith(".tar.gz") else ".zip"
        http_get(urls["archive"], art_path)
    else:
        art_path += ".bin"
        http_get(urls["binary"], art_path)

    checksums_path = os.path.join(tmpdir, f"{name}-{version}.checksums")
    http_get(urls["checksums"], checksums_path)

    # Verify integrity
    if not verify_with_checksums_file(art_path, checksums_path, expected_filename=expected_filename):
        raise RuntimeError(f"checksum verification failed for {name} v{version}")

    # Extract or place binary
    if kind == "archive":
        extracted_path = extract_archive(art_path, member_hint=member_hint, out_dir=tmpdir)
        # move or copy to bin
        final_path = os.path.join(bin_dir, target_name)
        shutil.move(extracted_path, final_path) if not os.path.exists(final_path) else shutil.copy2(extracted_path, final_path)
    else:
        final_path = os.path.join(bin_dir, target_name)
        shutil.copy2(art_path, final_path)

    # chmod +x
    os.chmod(final_path, 0o755)

    evidence = {
        "name": name,
        "version": version,
        "source": urls,
        "installed_path": final_path,
        "sha256": sha256_of(final_path),
        "sha3_512": sha3_512_of(final_path),
        "blake3": blake3_of(final_path),
    }
    return evidence

def main():
    """Entry point: install requested tools with verification and emit evidence report."""
    args = parse_args()
    requested = [t.strip() for t in args.tools.split(",") if t.strip()]
    cfg = load_inputs(args.inputs)
    catalog = {t["name"]: t for t in cfg.get("tools", [])}

    missing = [t for t in requested if t not in catalog]
    if missing:
        print(f"FATAL: requested tools missing from {args.inputs}: {missing}", file=sys.stderr)
        sys.exit(2)

    ensure_dir(os.path.dirname(args.out))
    ensure_dir(args.bin_dir)

    # temp workspace
    tmpdir = tempfile.mkdtemp(prefix="tool-inst-")
    installed = []
    failed = []
    try:
        for name in requested:
            try:
                ev = install_tool(catalog[name], args.bin_dir, tmpdir)
                installed.append(ev)
                print(f"Installed {name} v{ev['version']} -> {ev['installed_path']}")
            except Exception as e:
                failed.append({"name": name, "error": str(e)})
                print(f"ERROR installing {name}: {e}", file=sys.stderr)

        report = {
            "at": __import__("datetime").datetime.utcnow().isoformat() + "Z",
            "bin_dir": os.path.abspath(args.bin_dir),
            "installed": installed,
            "failed": failed,
            "inputs_file": args.inputs,
        }
        with open(args.out, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)
        # Exit non-zero if any failure
        sys.exit(1 if failed else 0)
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)

if __name__ == "__main__":
    main()
