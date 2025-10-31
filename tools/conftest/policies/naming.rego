package main

# File purpose: Conftest gate mirroring OPA naming checks (simplified).

deny[msg] {
  input.kind == "Namespace"
  not valid_name(input.metadata.name)
  msg := sprintf("namespace '%s' invalid (dns-1123)", [input.metadata.name])
}

deny[msg] {
  input.kind == "Deployment"
  not valid_name(input.metadata.name)
  msg := sprintf("deployment '%s' invalid (dns-1123)", [input.metadata.name])
}

valid_name(n) {
  re_match("^[a-z0-9]([-a-z0-9]*[a-z0-9])?$", n)
}