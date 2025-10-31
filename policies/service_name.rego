# Purpose: OPA policy for Kubernetes Service naming and ExternalName governance.
# - Single source of truth: data.policy_data (policies/data/policy-data.yaml)
# - Deny on violations with actionable messages (code, owner, quick fix)
package k8s.service.naming

import future.keywords.if
import data.policy_data

# Helpers
is_kind(k) { lower(input.kind) == lower(k) }
has(obj, key) { obj[key] }

# Service naming config sourced from data.policy_data
svc_cfg := {
  "pattern": policy_data.naming.service.pattern,
  "maxLength": policy_data.naming.service.maxLength,
  "requiredLabels": policy_data.naming.service.requiredLabels,
}

# ExternalName governance config sourced from data.policy_data
extn_cfg := {
  "requireFQDN": policy_data.externalName.validation.requireFQDN,
  "forbidWildcard": policy_data.externalName.validation.forbidWildcard,
  "forbidBareDomain": policy_data.externalName.validation.forbidBareDomain,
  "forbidDotless": policy_data.externalName.validation.forbidDotless,
  "forbidLocalhost": policy_data.externalName.validation.forbidLocalhost,
  "forbidIPLiteral": policy_data.externalName.validation.forbidIPLiteral,
  "maxLength": policy_data.externalName.validation.maxLength,
  "idnaNormalize": policy_data.externalName.validation.idnaNormalize,
  "allowlist": policy_data.externalName.allowlist,
  "denylist": policy_data.externalName.denylist,
  "exceptions": policy_data.externalName.exceptions,
  "owners": policy_data.externalName.owners,
  "audit": policy_data.externalName.audit,
}

# Namespace and owner resolution
default ns := ""
ns := input.metadata.namespace if has(input.metadata, "namespace")

default owner := extn_cfg.owners.defaultOwner
owner := input.metadata.labels[k] {
  extn_cfg.owners.required
  k := extn_cfg.owners.labelKeys[_]
  has(input.metadata, "labels")
  input.metadata.labels[k]
}

# ---------- Common checks: service naming ----------
deny[msg] {
  is_kind("Service")
  not re_match(svc_cfg.pattern, input.metadata.name)
  msg := violation("SVC_NAME_PATTERN", sprintf("Service/%s: name violates pattern %q", [input.metadata.name, svc_cfg.pattern]), fix := "使用小寫字元、數字與連字號，符合正則規範")
}

deny[msg] {
  is_kind("Service")
  count(input.metadata.name) > svc_cfg.maxLength
  msg := violation("SVC_NAME_TOO_LONG", sprintf("Service/%s: name length exceeds %d", [input.metadata.name, svc_cfg.maxLength]), fix := "縮短名稱至 63 字元以內")
}

deny[msg] {
  is_kind("Service")
  k := svc_cfg.requiredLabels[_]
  not has(input.metadata, "labels") or not input.metadata.labels[k]
  msg := violation("SVC_LABEL_MISSING", sprintf("Service/%s: missing label %q", [input.metadata.name, k]), fix := sprintf("在 metadata.labels 加入 %q", [k]))
}

# ---------- ExternalName specific ----------
is_externalname {
  is_kind("Service")
  has(input, "spec")
  input.spec.type == "ExternalName"
}

host := normalized_host {
  h := input.spec.externalName
  extn_cfg.idnaNormalize
  other := idna_ascii(h)
  host := other
} else := host {
  host := input.spec.externalName
}

# Pseudo IDNA normalization: lower + trim, punycode handling delegated to pipeline if needed
idna_ascii(h) = out {
  out := lower(trim(h))
}

# Pattern helpers
is_ip_literal(h) {
  # Lightweight detection; avoid strict parsing errors in policy runtime
  re_match("^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$", h)  # IPv4-like
} else = is_ip_literal(h) {
  contains(h, ":")  # naive IPv6 presence
}

matches_glob(pattern, s) {
  # Convert "*.example.com" -> regex "^.*\.example\.com$"
  rex := glob_to_regex(pattern)
  re_match(rex, s)
}

glob_to_regex(p) = out {
  tmp := replace(p, ".", "\\.")
  tmp2 := replace(tmp, "*", ".*")
  out := sprintf("^%s$", [tmp2])
}

segment_count(h) = n {
  segs := split(h, ".")
  n := count(segs)
}

exception_active(e) {
  e.host == host
  ns == e.namespaces[_]
  not expired(e.expires_at)
}

expired(ts) {
  # RFC3339 compare: simplified to non-expiring (requires server time plumbed for strict checks)
  false
}

# Priority: denylist > exceptions > allowlist > baseline rules

deny[msg] {
  is_externalname
  pattern := extn_cfg.denylist[_]
  matches_glob(pattern, host)
  msg := violation("EXTN_IN_DENYLIST", sprintf("Service/%s: ExternalName %q matched denylist %q", [input.metadata.name, host, pattern]), fix := "使用內部域名或允許清單中的域名；或提出例外申請")
}

# Exceptions allow override when active
allow_exception {
  is_externalname
  exception_active(extn_cfg.exceptions[_])
}

# Allowlist gate
deny[msg] {
  is_externalname
  not allow_exception
  not host_in_allowlist(host)
  msg := violation("EXTN_NOT_ALLOWED", sprintf("Service/%s: ExternalName %q is not in allowlist %v", [input.metadata.name, host, extn_cfg.allowlist]), fix := "將域名加入 allowlist 或改用已允許的域名；另可提交臨時例外")
}

host_in_allowlist(h) {
  extn_cfg.allowlist[_] == h
}

# Baseline validations
deny[msg] {
  is_externalname
  extn_cfg.forbidWildcard
  contains(host, "*")
  msg := violation("EXTN_WILDCARD", sprintf("Service/%s: ExternalName %q must not contain wildcard '*'", [input.metadata.name, host]), fix := "改為具體 FQDN，不使用 * 萬用字元")
}

deny[msg] {
  is_externalname
  extn_cfg.forbidBareDomain
  segment_count(host) == 2
  msg := violation("EXTN_BARE_DOMAIN", sprintf("Service/%s: ExternalName %q must not be a bare domain", [input.metadata.name, host]), fix := "加入子域名，例如 db.example.com")
}

deny[msg] {
  is_externalname
  extn_cfg.forbidDotless
  segment_count(host) < 2
  msg := violation("EXTN_DOTLESS", sprintf("Service/%s: ExternalName %q must contain at least one dot", [input.metadata.name, host]), fix := "使用有效的 FQDN")
}

deny[msg] {
  is_externalname
  extn_cfg.forbidLocalhost
  lower(host) == "localhost"
  msg := violation("EXTN_LOCALHOST", sprintf("Service/%s: ExternalName must not be localhost", [input.metadata.name]), fix := "改用服務可解析的內部 FQDN")
}

deny[msg] {
  is_externalname
  extn_cfg.forbidIPLiteral
  is_ip_literal(host)
  msg := violation("EXTN_IP_LITERAL", sprintf("Service/%s: ExternalName %q must not be an IP literal", [input.metadata.name, host]), fix := "改用對應的 FQDN 並納入 allowlist")
}

deny[msg] {
  is_externalname
  count(host) > extn_cfg.maxLength
  msg := violation("EXTN_TOO_LONG", sprintf("Service/%s: ExternalName %q length exceeds %d", [input.metadata.name, host, extn_cfg.maxLength]), fix := "縮短域名長度")
}

deny[msg] {
  is_externalname
  extn_cfg.requireFQDN
  segment_count(host) < 3
  msg := violation("EXTN_NOT_FQDN", sprintf("Service/%s: ExternalName %q must be a FQDN (>=3 segments)", [input.metadata.name, host]), fix := "補齊子域名，例如 db.internal.example.com")
}

# Violation message formatter with code/owner
violation(code, text, fix) = out {
  out := sprintf("%s | code=%s | owner=%s | fix=%s", [text, code, owner, fix])
}
