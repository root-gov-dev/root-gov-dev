# GitHub 倉庫恢復指南
## 如何恢復已刪除的 ops-core-root-system 倉庫

### 問題描述
`root-gov-dev/ops-core-root-system` 倉庫已被意外刪除，需要進行恢復。

---

## 📋 恢復方法

### 方法一：通過 GitHub 網頁介面恢復（推薦）

GitHub 提供了 90 天的倉庫恢復期，在此期間內可以輕鬆恢復已刪除的倉庫。

#### 步驟：

1. **登入 GitHub**
   - 訪問 https://github.com
   - 使用具有組織管理員權限的帳號登入

2. **進入組織設置頁面**
   - 訪問 https://github.com/root-gov-dev
   - 點擊 "Settings"（設置）標籤

3. **查找已刪除的倉庫**
   - 在左側菜單中，滾動到底部找到 "Deleted repositories"（已刪除的倉庫）
   - 或直接訪問：https://github.com/organizations/root-gov-dev/settings/deleted_repositories

4. **恢復倉庫**
   - 在列表中找到 `ops-core-root-system`
   - 點擊倉庫旁邊的 "Restore"（恢復）按鈕
   - 確認恢復操作

5. **驗證恢復**
   - 訪問 https://github.com/root-gov-dev/ops-core-root-system
   - 確認所有文件、分支、提交歷史和設置都已恢復

---

### 方法二：聯繫 GitHub 支持（如果超過 90 天）

如果倉庫刪除已超過 90 天，您需要聯繫 GitHub 支持團隊。

#### 步驟：

1. **訪問 GitHub 支持頁面**
   - 前往 https://support.github.com/contact

2. **提交恢復請求**
   - 選擇 "Account and Profile"（帳戶和個人資料）
   - 在描述中說明：
     - 組織名稱：`root-gov-dev`
     - 倉庫名稱：`ops-core-root-system`
     - 刪除的大約日期
     - 為什麼需要恢復此倉庫

3. **等待回應**
   - GitHub 支持團隊通常會在 24-48 小時內回應
   - 他們可能會要求提供額外的驗證信息

---

### 方法三：從本地克隆或備份恢復

如果您或團隊成員在本地有倉庫的克隆，可以將其推送到新創建的倉庫。

#### 步驟：

1. **在本地找到倉庫克隆**
   ```bash
   # 檢查是否有本地克隆
   find ~ -type d -name "ops-core-root-system" 2>/dev/null
   ```

2. **創建新的倉庫**
   - 訪問 https://github.com/organizations/root-gov-dev/repositories/new
   - 倉庫名稱：`ops-core-root-system`
   - 選擇適當的可見性設置（公開/私有）
   - 不要初始化 README、.gitignore 或 license
   - 點擊 "Create repository"（創建倉庫）

3. **推送本地克隆到新倉庫**
   ```bash
   cd /path/to/local/ops-core-root-system
   
   # 更新遠程 URL
   git remote set-url origin https://github.com/root-gov-dev/ops-core-root-system.git
   
   # 推送所有分支和標籤
   git push -u origin --all
   git push -u origin --tags
   ```

4. **恢復倉庫設置**
   - 手動配置分支保護規則
   - 重新添加協作者
   - 配置 webhooks 和集成
   - 恢復 GitHub Actions secrets

---

### 方法四：從其他團隊成員的克隆恢復

如果您沒有本地克隆，但其他團隊成員有：

1. **聯繫團隊成員**
   - 詢問是否有 `ops-core-root-system` 的本地克隆
   - 請他們運行 `git remote -v` 確認遠程 URL

2. **獲取倉庫副本**
   - 他們可以創建壓縮包：
     ```bash
     cd ops-core-root-system
     git bundle create ops-core-root-system.bundle --all
     ```
   - 將 bundle 文件發送給您

3. **從 bundle 恢復**
   ```bash
   # 創建新目錄
   mkdir ops-core-root-system
   cd ops-core-root-system
   
   # 從 bundle 克隆
   git clone ops-core-root-system.bundle .
   
   # 添加新的遠程倉庫
   git remote add origin https://github.com/root-gov-dev/ops-core-root-system.git
   
   # 推送所有內容
   git push -u origin --all
   git push -u origin --tags
   ```

---

## 🛡️ 預防措施

為避免將來再次發生類似情況，建議採取以下措施：

### 1. 啟用分支保護
- 在重要倉庫中啟用分支保護規則
- 要求至少一個審查者批准才能合併

### 2. 定期備份
設置自動備份策略：

```bash
#!/bin/bash
# 備份腳本示例
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d)

# 克隆倉庫（包括所有分支）
git clone --mirror https://github.com/root-gov-dev/ops-core-root-system.git \
  "$BACKUP_DIR/ops-core-root-system-$DATE"

# 創建壓縮檔案
cd "$BACKUP_DIR"
tar -czf "ops-core-root-system-$DATE.tar.gz" "ops-core-root-system-$DATE"
rm -rf "ops-core-root-system-$DATE"
```

### 3. 使用組織級別的權限控制
- 限制可以刪除倉庫的用戶
- 在組織設置中配置成員權限
- 使用團隊來管理訪問權限

### 4. 配置 GitHub Actions 備份
創建自動備份工作流程：

```yaml
name: Repository Backup
on:
  schedule:
    - cron: '0 2 * * 0'  # 每週日凌晨 2 點
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Create bundle
        run: |
          git bundle create backup.bundle --all
      
      - name: Upload backup
        uses: actions/upload-artifact@v4
        with:
          name: backup-${{ github.sha }}
          path: backup.bundle
          retention-days: 90
```

### 5. 文檔化重要倉庫
在主倉庫中維護一個重要倉庫列表：

```markdown
# 組織倉庫清單

## 核心倉庫
- `root-gov-dev` - 主要治理模組測試平台
- `ops-core-root-system` - 運維核心根系統
- `app` - 應用子系統

## 備份位置
- GitHub Actions artifacts
- 本地備份：/path/to/backups
- 異地備份：[雲存儲位置]
```

---

## 📞 需要協助？

如果以上方法都無法解決問題，請：

1. **檢查組織的審計日誌**
   - 訪問 https://github.com/organizations/root-gov-dev/settings/audit-log
   - 搜索 `ops-core-root-system` 相關的刪除事件
   - 確認刪除的確切時間和執行者

2. **聯繫 GitHub Premium Support**（如果有 GitHub Team 或 Enterprise 計劃）
   - 提供詳細的倉庫信息
   - 說明業務影響
   - 請求優先處理

3. **查看相關集成和服務**
   - 檢查 CI/CD 服務（如 GitHub Actions）
   - 檢查備份服務（如 BackHub、Rewind）
   - 檢查鏡像服務（如 GitLab 鏡像）

---

## ✅ 恢復後檢查清單

恢復倉庫後，請驗證：

- [ ] 所有分支都已恢復
- [ ] 標籤和發布版本完整
- [ ] 提交歷史正確
- [ ] 倉庫設置（可見性、功能）正確
- [ ] 分支保護規則已重新配置
- [ ] 協作者權限已恢復
- [ ] Webhooks 和集成已重新設置
- [ ] GitHub Actions secrets 已重新添加
- [ ] README 和文檔完整
- [ ] Issues 和 Pull Requests 已恢復（如果有）

---

## 📚 相關資源

- [GitHub 文檔：恢復已刪除的倉庫](https://docs.github.com/en/repositories/creating-and-managing-repositories/restoring-a-deleted-repository)
- [GitHub 文檔：倉庫刪除和恢復](https://docs.github.com/en/repositories/creating-and-managing-repositories/deleting-a-repository)
- [GitHub 支持](https://support.github.com)

---

**最後更新：** 2025-11-07  
**版本：** 1.0
