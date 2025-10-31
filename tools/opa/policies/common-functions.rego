package common

# File purpose: Common reusable helpers for naming governance Rego rules.

# is_k8s_name: validate K8s-like name pattern (DNS-1123 label: lowercase alnum, '-' allowed, start/end alnum).
is_k8s_name(name) {
  re_match("^[a-z0-9]([-a-z0-9]*[a-z0-9])?$", name)
}

# has_prefix: string has approved prefix (e.g., team/BU).
has_prefix(name, prefix) {
  startswith(name, concat("-", [prefix]))
} else {
  startswith(name, prefix)
}