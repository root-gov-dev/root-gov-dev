#!/usr/bin/env python3
# Purpose: Validate YAML module payloads against JSON Schema, execute test vectors, validate real configs, and emit auditable reports.
# Notes:
# - Strict schema (additionalProperties=false) is enforced.
# - Evidence: dual-hash (SHA3-512 + BLAKE3 fallback to SHA256) is computed for reports.
# - Outputs are written under artifacts/yaml-validation.

import argparse
import json
import sys
import os
import hashlib
from pathlib import Path
from typing import Any, Dict, List, Tuple

try:
  import yaml  # PyYAML
except Exception as e:
  print("PyYAML not installed. Please install pyyaml.", file=sys.stderr)
  sys.exit(2)

try:
  import jsonschema
  from jsonschema import Draft202012Validator
except Exception:
  print("jsonschema not installed. Please install jsonschema.", file=sys.stderr)
  sys.exit(2)


def hash_dual(data: bytes) -> Dict[str, str]:
  """Compute SHA3-512 and BLAKE3 (fallback SHA256) for evidence."""
  sha3 = hashlib.sha3_512(data).hexdigest()
  try:
    import blake3  # type: ignore
    b3 = blake3.blake3(data).hexdigest()
  except Exception:
    b3 = hashlib.sha256(data).hexdigest()
  return {"sha3_512": sha3, "blake3": b3}


def load_yaml(path: Path) -> Any:
  """Load YAML file into Python object."""
  with path.open("r", encoding="utf-8") as f:
    return yaml.safe_load(f)


def list_modules(modules_root: Path) -> List[Path]:
  """List module directories that contain schema.json."""
  out: List[Path] = []
  if not modules_root.exists():
    return out
  for d in sorted(modules_root.iterdir()):
    if d.is_dir() and (d / "schema.json").exists():
      out.append(d)
  return out


def validate_payload(validator: Draft202012Validator, payload: Any) -> Tuple[bool, List[str]]:
  """Validate payload and return (ok, errors)."""
  errors = sorted(validator.iter_errors(payload), key=lambda e: e.path)
  if errors:
    msgs = []
    for e in errors:
      loc = "/".join([str(p) for p in e.path])
      msgs.append(f"{loc or '<root>'}: {e.message}")
    return False, msgs
  return True, []


def run_test_vectors(module_dir: Path, out_dir: Path) -> Dict[str, Any]:
  """Run test vectors in module_dir/test-vectors/*.yaml against module_dir/schema.json."""
  report = {
    "module": module_dir.name,
    "schema": str(module_dir / "schema.json"),
    "vectors": [],
    "stats": {"total": 0, "passed": 0, "failed": 0},
  }
  schema = json.loads((module_dir / "schema.json").read_text(encoding="utf-8"))
  validator = Draft202012Validator(schema)

  vectors_dir = module_dir / "test-vectors"
  if not vectors_dir.exists():
    return report

  for vec in sorted(vectors_dir.glob("*.yaml")):
    vec_obj = load_yaml(vec) or {}
    name = vec_obj.get("name", vec.stem)
    valid_expected = bool(vec_obj.get("valid", True))
    payload = vec_obj.get("payload", {})
    ok, errs = validate_payload(validator, payload)
    passed = (ok == valid_expected)
    report["stats"]["total"] += 1
    if passed:
      report["stats"]["passed"] += 1
    else:
      report["stats"]["failed"] += 1
    report["vectors"].append({
      "name": name,
      "file": str(vec),
      "expected_valid": valid_expected,
      "actual_valid": ok,
      "passed": passed,
      "errors": errs
    })

  # Persist per-module vector report
  mod_out = out_dir / f"{module_dir.name}.vectors.json"
  mod_out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
  return report


def validate_configs(modules_root: Path, config_root: Path, out_dir: Path) -> Dict[str, Any]:
  """Validate real configs under config_root against corresponding module schema if present."""
  report: Dict[str, Any] = {"results": [], "stats": {"total": 0, "passed": 0, "failed": 0}}
  schema_cache: Dict[str, Draft202012Validator] = {}
  if not config_root.exists():
    return report

  for cfg in sorted(config_root.glob("*.yaml")):
    module_name = cfg.stem  # config/promotion-ticket.yaml -> module promotion-ticket
    schema_path = modules_root / module_name / "schema.json"
    if not schema_path.exists():
      continue
    if module_name not in schema_cache:
      schema = json.loads(schema_path.read_text(encoding="utf-8"))
      schema_cache[module_name] = Draft202012Validator(schema)
    payload = load_yaml(cfg) or {}
    ok, errs = validate_payload(schema_cache[module_name], payload)
    report["stats"]["total"] += 1
    if ok:
      report["stats"]["passed"] += 1
    else:
      report["stats"]["failed"] += 1
    report["results"].append({
      "config": str(cfg),
      "module": module_name,
      "valid": ok,
      "errors": errs
    })

  (out_dir / "configs.validation.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
  return report


def write_summary(all_results: Dict[str, Any], out_dir: Path) -> None:
  """Write Markdown and JSON summary with hashes for traceability."""
  overall = all_results["overall"]
  vectors = all_results["modules"]
  configs = all_results["configs"]
  md_lines = []
  md_lines.append("# YAML Deep Validation Summary")
  md_lines.append("")
  md_lines.append(f"- Modules tested: {overall['modules']}")
  md_lines.append(f"- Vectors: total={overall['vectors_total']}, passed={overall['vectors_passed']}, failed={overall['vectors_failed']}")
  md_lines.append(f"- Configs: total={configs['stats']['total']}, passed={configs['stats']['passed']}, failed={configs['stats']['failed']}")
  md_lines.append("")
  md_lines.append("## Per-Module Vector Results")
  for m in vectors:
    st = m["stats"]
    md_lines.append(f"- {m['module']}: total={st['total']}, passed={st['passed']}, failed={st['failed']}")
  md = "\n".join(md_lines)
  (out_dir / "summary.md").write_text(md, encoding="utf-8")

  # JSON report + evidence hash
  raw = json.dumps(all_results, ensure_ascii=False, indent=2).encode("utf-8")
  ev = hash_dual(raw)
  bundle = {"report": all_results, "evidence": ev}
  (out_dir / "report.json").write_text(json.dumps(bundle, ensure_ascii=False, indent=2), encoding="utf-8")


def main():
  """CLI entrypoint: run validation across modules and configs."""
  ap = argparse.ArgumentParser(description="Validate YAML modules (schema + vectors + configs)")
  ap.add_argument("--modules-root", default="governance/modules", help="Modules root folder")
  ap.add_argument("--config-root", default="config", help="Config root folder")
  ap.add_argument("--out", default="artifacts/yaml-validation", help="Output directory for reports")
  args = ap.parse_args()

  modules_root = Path(args.modules_root)
  config_root = Path(args.config_root)
  out_dir = Path(args.out)
  out_dir.mkdir(parents=True, exist_ok=True)

  modules = list_modules(modules_root)
  per_module_reports: List[Dict[str, Any]] = []
  vec_total = vec_pass = vec_fail = 0

  for mdir in modules:
    r = run_test_vectors(mdir, out_dir)
    per_module_reports.append(r)
    vec_total += r["stats"]["total"]
    vec_pass += r["stats"]["passed"]
    vec_fail += r["stats"]["failed"]

  configs_report = validate_configs(modules_root, config_root, out_dir)

  overall = {
    "modules": len(modules),
    "vectors_total": vec_total,
    "vectors_passed": vec_pass,
    "vectors_failed": vec_fail,
  }
  all_results = {"overall": overall, "modules": per_module_reports, "configs": configs_report}
  write_summary(all_results, out_dir)

  # Fail pipeline if any vector failed or any config invalid
  if vec_fail > 0 or configs_report["stats"]["failed"] > 0:
    print("Validation failed: vectors or configs invalid.", file=sys.stderr)
    sys.exit(1)
  print("Validation passed.")


if __name__ == "__main__":
  main()
