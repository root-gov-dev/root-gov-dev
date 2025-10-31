# File purpose:
#   OPA policy for Kubernetes Service naming and ExternalName governance.
#   Reads centralized data from data.policy_data (see policies/data/policy_data.yaml).
#
# Coverage:
#   - Service name pattern and length
#   - Required labels (namespace.io/domain, namespace.io/lifecycle)
#   - ExternalName rules: FQDN required, no wildcard, no bare domain, length limit, allowlist membership
#
# Usage:
#   opa eval --data policies/data/policy_data.yaml \
#            --data tools/opa/policies/naming/service_name.rego \
#            --input manifests/service.yaml \
#            'data.k8s.service.naming.deny'

package k8s.service.naming

import data.policy_data

# Helper: is Service kind
is_service {
  input.kind == "Service"
}

# Helper: read service naming config with sane defaults to avoid runtime errors
svc_cfg := cfg {
  some _  # prefer provided policy_data; else defaults
  cfg := {
    "pattern": policy_data.naming.service.pattern,
    "maxLength": policy_data.naming.service.maxLength,
    "requiredLabels": policy_data.naming.service.requiredLabels,
  }
} else = cfg {
  cfg := {
    "pattern": "^[a-z0-9]([-a-z0-9]*[a-z0-9])$",
    "maxLength": 63,
    "requiredLabels": ["namespace.io/domain", "namespace.io/lifecycle"],
  }
}

# Helper: ExternalName rules and allowlist
extn_cfg := ecfg {
  some _
  ecfg := {
    "requireFQDN": policy_data.externalName.rules.requireFQDN,
    "wildcard": policy_data.externalName.rules.wildcard,
    "bareDomain": policy_data.externalName.rules.bareDomain,
    "maxLength": policy_data.externalName.rules.maxLength,
    "allowlist": policy_data.externalName.allowlist,
  }
} else = ecfg {
  ecfg := {
    "requireFQDN": true,
    "wildcard": false,
    "bareDomain": false,
    "maxLength": 253,
    "allowlist": ["svc.cluster.local"],
  }
}

# Deny if name does not match configured regex
deny[msg] {
  is_service
  not re_match(svc_cfg.pattern, input.metadata.name)
  msg := sprintf("Service/%s: name violates pattern %q", [input.metadata.name, svc_cfg.pattern])
}

# Deny if name exceeds max length
deny[msg] {
  is_service
  count(input.metadata.name) > svc_cfg.maxLength
  msg := sprintf("Service/%s: name length exceeds %d", [input.metadata.name, svc_cfg.maxLength])
}

# Deny if required labels are missing
deny[msg] {
  is_service
  some k
  k := svc_cfg.requiredLabels[_]
  not input.metadata.labels[k]
  msg := sprintf("Service/%s: missing label %q", [input.metadata.name, k])
}

# ---- ExternalName validations ----

# Identify ExternalName kind/type
is_externalname_service {
  is_service
  input.spec.type == "ExternalName"
}

# Require FQDN (at least 3 segments like a.b.c)
deny[msg] {
  is_externalname_service
  extn_cfg.requireFQDN
  host := input.spec.externalName
  count(split(host, ".")) < 3
  msg := sprintf("Service/%s: ExternalName %q must be a FQDN (>=3 segments)", [input.metadata.name, host])
}

# Forbid wildcard usage when disallowed
deny[msg] {
  is_externalname_service
  extn_cfg.wildcard == false
  contains(input.spec.externalName, "*")
  msg := sprintf("Service/%s: ExternalName %q must not contain wildcard '*'", [input.metadata.name, input.spec.externalName])
}

# Forbid bare domain (exactly 2 segments) when disallowed
deny[msg] {
  is_externalname_service
  extn_cfg.bareDomain == false
  host := input.spec.externalName
  count(split(host, ".")) == 2
  msg := sprintf("Service/%s: ExternalName %q must not be bare domain", [input.metadata.name, host])
}

# Enforce length limit
deny[msg] {
  is_externalname_service
  host := input.spec.externalName
  count(host) > extn_cfg.maxLength
  msg := sprintf("Service/%s: ExternalName %q length exceeds %d", [input.metadata.name, host, extn_cfg.maxLength])
}

# Enforce allowlist (exact match)
deny[msg] {
  is_externalname_service
  host := input.spec.externalName
  not host_in_allowlist(host)
  msg := sprintf("Service/%s: ExternalName %q is not in allowlist %v", [input.metadata.name, host, extn_cfg.allowlist])
}

# Return true if host is in allowlist
host_in_allowlist(h) {
  some i
  extn_cfg.allowlist[i] == h
}
