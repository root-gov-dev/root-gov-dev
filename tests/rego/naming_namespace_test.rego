package naming.namespace

# File purpose: Unit tests for namespace naming policy.

import data.naming.namespace

test_valid_namespace {
  input := {"kind":"Namespace","metadata":{"name":"team-a"},"policy":{"required_prefix":""}}
  namespace.allow with input as input
}

test_invalid_prefix {
  input := {"kind":"Namespace","metadata":{"name":"prod-a"},"policy":{"required_prefix":"team-"}}
  not namespace.allow with input as input
}