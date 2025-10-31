package naming.namespace

import data.common

# File purpose: Enforce namespace naming conventions.

default allow = false

# Allow when name follows DNS-1123 and uses required prefix if configured.
allow {
  input.kind == "Namespace"
  name := input.metadata.name
  common.is_k8s_name(name)
  not violates_prefix
}

violates_prefix {
  required := input.policy.required_prefix
  required != ""
  not startswith(input.metadata.name, required)
}

violation[msg] {
  input.kind == "Namespace"
  not allow
  msg := sprintf("namespace '%s' violates naming policy (prefix='%s')", [input.metadata.name, input.policy.required_prefix])
}