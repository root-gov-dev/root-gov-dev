package naming.workload

import data.common

# File purpose: Enforce workload (Deployment/StatefulSet/DaemonSet) naming conventions.

kinds := {"Deployment", "StatefulSet", "DaemonSet", "Job", "CronJob"}

default allow = false

allow {
  kinds[input.kind]
  n := input.metadata.name
  common.is_k8s_name(n)
}

violation[msg] {
  kinds[input.kind]
  not allow
  msg := sprintf("workload '%s/%s' violates naming policy", [input.kind, input.metadata.name])
}