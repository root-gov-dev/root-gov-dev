# 🚨 緊急恢復步驟 - ops-core-root-system 倉庫
## Quick Recovery Steps - ops-core-root-system Repository

---

## 🎯 立即行動 / Immediate Action

### ✅ 最快恢復方法（90天內刪除）/ Fastest Method (Deleted within 90 days)

1. **訪問 GitHub 組織的已刪除倉庫頁面**  
   **Visit GitHub organization's deleted repositories page**
   
   ```
   https://github.com/organizations/root-gov-dev/settings/deleted_repositories
   ```

2. **找到並恢復倉庫**  
   **Find and restore the repository**
   
   - 在列表中找到 `ops-core-root-system`
   - Find `ops-core-root-system` in the list
   - 點擊 "Restore" 按鈕
   - Click "Restore" button
   - ✅ 完成！/ Done!

---

## 🔍 檢查本地備份 / Check Local Backup

如果 GitHub 恢復不可用，檢查本地是否有克隆：  
If GitHub restore is unavailable, check for local clones:

```bash
# 搜索本地克隆 / Search for local clones
find ~ -type d -name "ops-core-root-system" 2>/dev/null

# 如果找到，進入目錄並檢查 / If found, enter directory and check
cd /path/to/ops-core-root-system
git remote -v
git status
```

---

## 📞 聯繫團隊 / Contact Team

詢問團隊成員是否有本地克隆：  
Ask team members if they have local clones:

**需要詢問的問題 / Questions to ask:**
1. 是否有 `ops-core-root-system` 的本地克隆？  
   Do you have a local clone of `ops-core-root-system`?

2. 最後一次 pull/fetch 是什麼時候？  
   When was your last pull/fetch?

3. 可以運行 `git bundle create backup.bundle --all` 創建備份嗎？  
   Can you run `git bundle create backup.bundle --all` to create a backup?

---

## 🆘 GitHub 支持 / GitHub Support

如果以上方法都失敗：  
If all above methods fail:

1. **聯繫 GitHub Support**
   ```
   https://support.github.com/contact
   ```

2. **提供以下信息 / Provide this information:**
   - 組織：`root-gov-dev`
   - 倉庫：`ops-core-root-system`
   - 刪除日期（如果知道）/ Deletion date (if known)
   - 需要恢復的原因 / Reason for recovery

---

## 📋 恢復後檢查 / Post-Recovery Checks

- [ ] 倉庫可訪問 / Repository accessible
- [ ] 所有分支存在 / All branches present
- [ ] 提交歷史完整 / Commit history intact
- [ ] 設置正確 / Settings correct
- [ ] 添加備份策略 / Add backup strategy

---

## 📚 完整指南 / Full Guides

詳細說明請參閱：  
For detailed instructions, see:

- 中文完整指南：`REPOSITORY_RECOVERY_GUIDE.md`
- English full guide: `REPOSITORY_RECOVERY_GUIDE_EN.md`

---

**緊急聯絡 / Emergency Contact:**  
如有疑問，請在 root-gov-dev 倉庫開 issue  
For questions, open an issue in the root-gov-dev repository

**創建時間 / Created:** 2025-11-07
