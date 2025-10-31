#!/usr/bin/env node
/**
 * Purpose: Minimal dependency bump utility for Node/Go modules with conservative rules.
 * Behavior:
 *  - For package.json, bump patch versions (x.y.z -> x.y.(z+1)) unless locked by exact version or range contains tags.
 *  - For go.mod, run `go get -u=patch` if available.
 *  - Emits a JSON report to stdout and writes updated files in place (no commit).
 */
const fs = require('fs');
const cp = require('child_process');

function bumpPatch(v) {
  const m = v.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return v;
  return `${m[1]}.${m[2]}.${parseInt(m[3],10)+1}`;
}

const report = { updated: [], skipped: [] };

if (fs.existsSync('package.json')) {
  const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
  const deps = ['dependencies','devDependencies','peerDependencies'];
  for (const section of deps) {
    if (!pkg[section]) continue;
    for (const [name, ver] of Object.entries(pkg[section])) {
      if (/^[0-9]+\.[0-9]+\.[0-9]+$/.test(ver)) {
        const newVer = bumpPatch(ver);
        if (newVer !== ver) {
          pkg[section][name] = newVer;
          report.updated.push({type:'npm', name, from: ver, to: newVer});
        }
      } else {
        report.skipped.push({type:'npm', name, reason:'non-exact or tag/range', ver});
      }
    }
  }
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
}

if (fs.existsSync('go.mod')) {
  try {
    cp.execSync('go version', {stdio:'ignore'});
    try {
      cp.execSync('go get -u=patch ./...', {stdio:'inherit'});
      report.updated.push({type:'go', cmd:'go get -u=patch ./...'});
    } catch (e) {
      report.skipped.push({type:'go', reason:'go get failed'});
    }
  } catch (e) {
    report.skipped.push({type:'go', reason:'go not installed'});
  }
}

process.stdout.write(JSON.stringify(report, null, 2) + "\n");
