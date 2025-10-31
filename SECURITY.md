# Security Policy

## Supported Versions

我們致力於維護 root-gov-dev 的安全性。以下是目前支援的版本：

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| dev     | :white_check_mark: |

## Reporting a Vulnerability

如果您發現安全漏洞，請透過以下方式回報：

1. **請勿公開披露**：在問題解決之前，請不要在公開的 issue 或論壇中發布安全漏洞的詳細資訊。

2. **聯繫方式**：
   - 建立一個 private security advisory：前往本專案的 GitHub Security Advisories
   - 或發送電子郵件至專案維護者

3. **提供資訊**：
   - 漏洞的詳細描述
   - 重現步驟
   - 潛在影響範圍
   - 建議的修復方案（如有）

4. **回應時效**：
   - 我們會在 48 小時內確認收到您的回報
   - 在 7 個工作日內提供初步評估
   - 根據漏洞嚴重程度，制定修復計畫

## Security Best Practices

在使用 root-gov-dev 時，建議遵循以下安全實踐：

- 定期更新到最新版本
- 使用強密碼和金鑰管理
- 啟用多因素認證（如適用）
- 定期審查存取權限和日誌
- 遵循最小權限原則
- 定期備份重要資料

## Supply Chain Security

本專案使用多層供應鏈安全措施：

- SBOM（Software Bill of Materials）自動生成
- 依賴項漏洞掃描
- 容器映像簽章與驗證
- 自動化安全測試

詳細資訊請參閱 [Supply Chain README](./supplychain/README.md)。

## Security Updates

安全更新將透過以下方式發布：

- GitHub Security Advisories
- Release Notes
- 專案公告

## Acknowledgments

我們感謝所有負責任地回報安全問題的研究人員和社群成員。