package naming.cm_sec_test

# File purpose: Unit tests for ConfigMap/Secret naming/labels policy.

import data.naming.configmap
import data.naming.secret

test_configmap_valid {
  input := {
    "kind": "ConfigMap",
    "metadata": {
      "name": "team-platform-api-config",
      "labels": {
        "namespace.io/team": "platform",
        "namespace.io/environment": "dev",
        "namespace.io/lifecycle": "active",
        "namespace.io/managed-by": "helm",
        "namespace.io/contract-ref": "urn:namespace:contract:core:v1"
      }
    }
  }
  configmap.allow with input as input
}

test_secret_valid {
  input := {
    "kind": "Secret",
    "metadata": {
      "name": "team-platform-api-credentials",
      "labels": {
        "namespace.io/team": "platform",
        "namespace.io/environment": "staging",
        "namespace.io/lifecycle": "active",
        "namespace.io/managed-by": "gitops",
        "namespace.io/contract-ref": "urn:namespace:contract:core:v1"
      }
    }
  }
  secret.allow with input as input
}

test_secret_invalid_name {
  input := {
    "kind": "Secret",
    "metadata": {
      "name": "credentials",
      "labels": {
        "namespace.io/team": "platform",
        "namespace.io/environment": "staging",
        "namespace.io/lifecycle": "active",
        "namespace.io/managed-by": "gitops",
        "namespace.io/contract-ref": "urn:namespace:contract:core:v1"
      }
    }
  }
  not secret.allow with input as input
}