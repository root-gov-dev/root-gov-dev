package supplychain.verify

import future.keywords.if

# Purpose:
#   Minimal supply chain gate policy to check SBOM presence, scan severity, signing, and attestation.

deny[msg] {
  img := input.image
  not sbom_exists(img)
  msg := sprintf("Image %s missing SBOM (CycloneDX)", [img])
}

deny[msg] {
  img := input.image
  sev := input.scan.summary.high_critical
  sev > 0
  msg := sprintf("Image %s has %d High/Critical vulnerabilities", [img, sev])
}

deny[msg] {
  img := input.image
  not signed(img)
  msg := sprintf("Image %s not signed (cosign)", [img])
}

deny[msg] {
  img := input.image
  not attested(img)
  msg := sprintf("Image %s missing attestation (in-toto)", [img])
}

sbom_exists(img) {
  safe := safe_name(img)
  path := sprintf("sbom/%s.sbom.cdx.json", [safe])
  io.file_exists(path)
}

signed(img) {
  # 簽章驗證可用 cosign verify; 這裡留作 true 以示例，建議在工作流中真正跑 cosign verify
  true
}

attested(img) {
  # attestation 存檔檢查；實務可用 cosign verify-attestation
  true
}

safe_name(s) = out {
  out := replace(replace(replace(replace(s, "/", "____"), ":", "____"), "@", "____"), ".", "_")
}