package naming.service_test

# File purpose: Unit tests for Service naming/labels policy.

import data.naming.service

test_service_valid {
  input := {
    "kind": "Service",
    "metadata": {
      "name": "team-platform-api",
      "labels": {
        "namespace.io/team": "platform",
        "namespace.io/environment": "production",
        "namespace.io/lifecycle": "active",
        "namespace.io/managed-by": "gitops",
        "namespace.io/contract-ref": "urn:namespace:contract:core:v1"
      }
    },
    "spec": {
      "type": "ClusterIP",
      "selector": {"app.kubernetes.io/name": "platform-api", "app.kubernetes.io/instance":"platform-api-prod"},
      "ports": [{"name":"http","port":80,"targetPort":8080,"protocol":"TCP"}]
    }
  }
  service.allow with input as input
}

test_service_invalid_name {
  input := {
    "kind": "Service",
    "metadata": {
      "name": "platform-api",
      "labels": {
        "namespace.io/team": "platform",
        "namespace.io/environment": "production",
        "namespace.io/lifecycle": "active",
        "namespace.io/managed-by": "gitops",
        "namespace.io/contract-ref": "urn:namespace:contract:core:v1"
      }
    }
  }
  not service.allow with input as input
}