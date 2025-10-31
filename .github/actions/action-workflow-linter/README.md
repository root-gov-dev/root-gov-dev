# Workflow Linter & Auto-Fixer

A composite action that scans `.github/workflows` and proposes secure, reproducible fixes:
- Pin all actions to commit SHA placeholders
- Enforce least-privilege permissions (contents: read)
- Add concurrency and job-level timeouts
- Emit unified patch and audit reports

Why it converts:
- Zero third-party actions dependency, safe-by-default
- Works on any repository with only `bash` and `git`
- Ideal for org-scale governance and marketplace subscriptions

Quickstart:
```yaml
jobs:
  gov:
    runs-on: ubuntu-latest
    steps:
      - run: git clone "$REPO" repo && cd repo
      - uses: ./.github/actions/action-workflow-linter
        with:
          patch-out: outputs/patch.diff
          report-json: outputs/auto-fix.json
          report-md: outputs/auto-fix.md
```

Commercial add-ons:
- Enterprise auto-PR with signed commits
- SHA resolution service & allowlist
- Org-wide policy telemetry and compliance dashboards