package naming.workload

# File purpose: Unit tests for workload naming policy.

import data.naming.workload

test_valid_deployment {
  input := {"kind":"Deployment","metadata":{"name":"api-server"}}
  workload.allow with input as input
}

test_invalid_deployment {
  input := {"kind":"Deployment","metadata":{"name":"API"}}
  not workload.allow with input as input
}