package naming.secret

import data.common

# File purpose: Naming and required labels for Secret resources.

default allow = false

required_labels := {
  "namespace.io/team",
  "namespace.io/environment",
  "namespace.io/lifecycle",
  "namespace.io/managed-by",
  "namespace.io/contract-ref",
}

allow {
  input.kind == "Secret"
  name_ok
  labels_ok
}

name_ok {
  common.is_k8s_name(input.metadata.name)
  re_match("^(team|tenant|feature)-[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$", input.metadata.name)
  count(input.metadata.name) &lt;= 63
}

labels_ok {
  some k
  forall(required_labels, func(k) { input.metadata.labels[k] })
}

forall(s, f) {
  not exists_missing(s, f)
}

exists_missing(s, f) {
  some x
  s[x]
  not f(x)
}

violation[msg] {
  input.kind == "Secret"
  not allow
  msg := sprintf("secret '%s' violates naming/labels policy", [input.metadata.name])
}