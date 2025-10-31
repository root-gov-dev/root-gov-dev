#!/usr/bin/env python3
"""
Purpose: Patch an OpenAPI document (YAML/JSON) to enforce certain governance fields (contact, license, version).
Usage:
  openapi_patch.py --in openapi.yaml --out openapi.patched.yaml --contact "Ops <ops@example.com>" --license "Apache-2.0" --version "1.0.1"
"""
import argparse, sys, json, yaml, os

def main():
  p = argparse.ArgumentParser()
  p.add_argument("--in", dest="inp", required=True)
  p.add_argument("--out", dest="out", required=True)
  p.add_argument("--contact", default=None)
  p.add_argument("--license", default=None)
  p.add_argument("--version", default=None)
  args = p.parse_args()

  with open(args.inp, "r") as f:
    # try YAML first
    try:
      doc = yaml.safe_load(f)
    except Exception:
      f.seek(0); doc = json.load(f)

  if "info" not in doc: doc["info"] = {}
  if args.version: doc["info"]["version"] = args.version
  if args.contact:
    if "contact" not in doc["info"]: doc["info"]["contact"] = {}
    doc["info"]["contact"]["name"] = args.contact
  if args.license:
    if "license" not in doc["info"]: doc["info"]["license"] = {}
    doc["info"]["license"]["name"] = args.license

  with open(args.out, "w") as f:
    if args.out.endswith(".json"):
      json.dump(doc, f, indent=2, ensure_ascii=False)
    else:
      yaml.safe_dump(doc, f, sort_keys=False)

if __name__ == "__main__":
  main()
