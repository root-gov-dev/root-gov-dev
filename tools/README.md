# Tools Catalog and Installer

This directory contains:
- required-inputs.yaml: pinned tool versions and official checksum URLs (SoT)
- install_tools.py: deterministic installer with evidence hashing

Design:
- No fabricated checksum values in-repo; verification is performed against the vendor-provided checksums file for the exact version.
- All installs land in `./bin`. Append it to PATH in workflows:
  `echo "PATH=$(pwd)/bin:$PATH" >> "$GITHUB_ENV"`

Add a new tool:
1) Append an entry to `required-inputs.yaml` with name, version, urls, and hints.
2) In workflow, add the tool to `--tools` list in `scripts/install_tools.py` invocation.

Security:
- SHA256 verified against official checksums doc
- Evidence report includes SHA3-512 and BLAKE3 hashes