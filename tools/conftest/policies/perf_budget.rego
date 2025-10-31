package perf

# File purpose: Conftest example policy for basic performance budgets.

warn[msg] {
  input.kind == "Deployment"
  limits := input.spec.template.spec.containers[_].resources.limits.cpu
  not limits
  msg := "cpu limits not set"
}

warn[msg] {
  input.kind == "Deployment"
  limits := input.spec.template.spec.containers[_].resources.limits.memory
  not limits
  msg := "memory limits not set"
}