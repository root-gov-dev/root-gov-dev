# Kyverno Bridge
- 切換 Audit/Enforce：spec.validationFailureAction
- 例外機制：在資源上加 annotation `policy.namespace.io/exception: "true"`（需設有到期清單）
- 建議配套：.github/workflows/matrix-governance.yaml 進行 Gatekeeper 與 Kyverno 雙跑驗證