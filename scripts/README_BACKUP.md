# 倉庫備份工具 / Repository Backup Tools

本目錄包含用於備份 root-gov-dev 組織倉庫的工具和腳本。  
This directory contains tools and scripts for backing up root-gov-dev organization repositories.

---

## 📦 可用工具 / Available Tools

### 1. 自動化備份腳本 / Automated Backup Script

**文件**: `backup-repositories.sh`

這是一個 Bash 腳本，可以自動備份指定的 GitHub 倉庫。

#### 使用方法 / Usage:

```bash
# 基本用法 / Basic usage
./scripts/backup-repositories.sh

# 自定義備份目錄 / Custom backup directory
BACKUP_DIR=/path/to/backups ./scripts/backup-repositories.sh

# 啟用自動清理舊備份（保留 30 天）
# Enable automatic cleanup of old backups (keep 30 days)
CLEANUP_OLD_BACKUPS=true ./scripts/backup-repositories.sh
```

#### 備份內容 / What Gets Backed Up:

- 所有分支 / All branches
- 所有標籤 / All tags  
- 完整提交歷史 / Complete commit history
- 所有引用 / All references

#### 輸出格式 / Output Format:

- `<repo-name>.bundle` - Git bundle 文件（可移植）
- `<repo-name>.tar.gz` - 壓縮歸檔
- `backup_manifest.txt` - 備份清單

---

### 2. GitHub Actions 工作流程 / GitHub Actions Workflow

**文件**: `../.github/workflows/repository-backup.yml`

自動化的 GitHub Actions 工作流程，定期備份倉庫。

#### 特性 / Features:

- ✅ 每週日凌晨 2 點自動運行
- ✅ 支持手動觸發
- ✅ 將備份存儲為 GitHub Actions artifacts
- ✅ 90 天保留期
- ✅ 並行備份多個倉庫
- ✅ 生成詳細的備份報告

#### 手動觸發 / Manual Trigger:

1. 前往 Actions 標籤 / Go to Actions tab
2. 選擇 "Automated Repository Backup"
3. 點擊 "Run workflow"

---

## 🔄 從備份恢復 / Restore from Backup

### 從 Bundle 恢復 / Restore from Bundle:

```bash
# 從 bundle 克隆 / Clone from bundle
git clone <repo-name>.bundle <directory-name>

cd <directory-name>

# 添加遠程倉庫 / Add remote
git remote add origin https://github.com/root-gov-dev/<repo-name>.git

# 推送所有內容 / Push everything
git push --mirror
```

### 從壓縮檔案恢復 / Restore from Archive:

```bash
# 解壓 / Extract
tar -xzf <repo-name>.tar.gz

cd <repo-name>.git

# 設置為正常倉庫 / Convert to normal repository
git config --bool core.bare false

# 或者創建新克隆 / Or create new clone
cd ..
git clone <repo-name>.git <new-directory>
```

---

## 📋 配置倉庫列表 / Configure Repository List

要更改要備份的倉庫，請編輯：  
To change which repositories get backed up, edit:

### 在 Bash 腳本中 / In Bash Script:

```bash
# 文件: backup-repositories.sh
REPOS=(
    "root-gov-dev"
    "ops-core-root-system"
    "app"
    # 添加更多倉庫 / Add more repositories
)
```

### 在 GitHub Actions 中 / In GitHub Actions:

```yaml
# 文件: .github/workflows/repository-backup.yml
strategy:
  matrix:
    repository:
      - root-gov-dev
      - ops-core-root-system
      - app
      # 添加更多倉庫 / Add more repositories
```

---

## 🔐 安全注意事項 / Security Notes

1. **私有倉庫**: 備份腳本需要適當的 GitHub 認證才能訪問私有倉庫  
   **Private Repos**: Backup script needs proper GitHub authentication for private repositories

2. **存儲**: 確保備份存儲在安全的位置  
   **Storage**: Ensure backups are stored in a secure location

3. **訪問控制**: 限制對備份文件的訪問  
   **Access Control**: Restrict access to backup files

4. **加密**: 考慮加密敏感倉庫的備份  
   **Encryption**: Consider encrypting backups of sensitive repositories

---

## 🛠️ 故障排除 / Troubleshooting

### 認證錯誤 / Authentication Errors

如果遇到認證問題：  
If you encounter authentication issues:

```bash
# 使用 GitHub CLI 認證 / Authenticate with GitHub CLI
gh auth login

# 或使用個人訪問令牌 / Or use personal access token
git config --global credential.helper store
```

### 大型倉庫 / Large Repositories

對於非常大的倉庫：  
For very large repositories:

```bash
# 增加 Git 緩衝區大小 / Increase Git buffer size
git config --global http.postBuffer 524288000

# 或使用淺克隆（不推薦用於備份）
# Or use shallow clone (not recommended for backups)
git clone --mirror --depth=1 <url>
```

---

## 📊 監控備份 / Monitor Backups

### 檢查最新備份 / Check Latest Backup:

```bash
# 列出備份目錄 / List backup directory
ls -lt ~/github-backups/ | head -5

# 檢查備份完整性 / Verify backup integrity
git bundle verify <repo-name>.bundle
```

### GitHub Actions 狀態 / GitHub Actions Status:

訪問：https://github.com/root-gov-dev/root-gov-dev/actions  
Visit: https://github.com/root-gov-dev/root-gov-dev/actions

---

## 📖 相關文檔 / Related Documentation

- [快速恢復步驟](../QUICK_RECOVERY_STEPS.md)
- [完整恢復指南（中文）](../REPOSITORY_RECOVERY_GUIDE.md)
- [Full Recovery Guide (English)](../REPOSITORY_RECOVERY_GUIDE_EN.md)

---

**維護者 / Maintainer**: root-gov-dev organization  
**最後更新 / Last Updated**: 2025-11-07
