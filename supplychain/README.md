# Supply Chain Guardrail: SBOM + Scan + Sign + Attest

目的
- 在 PR 階段自動生成 SBOM、漏洞掃描、簽章與 attestation
- 若發現違規（高危 CVE 或缺 SBOM/簽章/attestation），嘗試自動修復
- 修復後重新掃描並驗證政策，確保最終合規

運作邏輯
1. Enumerate images → 生成 CycloneDX SBOM
2. Grype 掃描（High/Critical）→ 若命中且 ALLOW_AUTO_FIX=true，執行 auto_fix
3. auto_fix 會根據 replacement_map 替換成已審核的 baseline 鏡像
4. 重新掃描 → 若仍有高危，工作流失敗（阻擋合併）
5. cosign sign/attest → 輸出簽章與 attestation（可改 verify 模式）
6. 政策驗證 → 逐張驗證 SBOM、簽章、attestation 存在且高危為 0

自訂
- supplychain/config/tools.yaml 內可調版本、阻擋等級、replacement_map
- 若企業使用 KMS/私鑰，將 cosign.mode 改為 kms 或 key-file，並配置密鑰來源

本地測試（可選）
- 用非合規與合規範例快速驗證：
  - manifests/examples/noncompliant.yaml
  - manifests/examples/compliant.yaml
