# GitHub Repository Recovery Guide
## How to Recover the Deleted ops-core-root-system Repository

### Issue Description
The `root-gov-dev/ops-core-root-system` repository was accidentally deleted and needs to be recovered.

---

## 📋 Recovery Methods

### Method 1: Recover via GitHub Web Interface (Recommended)

GitHub provides a 90-day recovery period for deleted repositories, during which you can easily restore them.

#### Steps:

1. **Log in to GitHub**
   - Visit https://github.com
   - Log in with an account that has organization admin permissions

2. **Navigate to Organization Settings**
   - Go to https://github.com/root-gov-dev
   - Click on the "Settings" tab

3. **Find Deleted Repositories**
   - In the left sidebar, scroll to the bottom to find "Deleted repositories"
   - Or visit directly: https://github.com/organizations/root-gov-dev/settings/deleted_repositories

4. **Restore the Repository**
   - Find `ops-core-root-system` in the list
   - Click the "Restore" button next to the repository
   - Confirm the restoration

5. **Verify Recovery**
   - Visit https://github.com/root-gov-dev/ops-core-root-system
   - Confirm that all files, branches, commit history, and settings have been restored

---

### Method 2: Contact GitHub Support (If Past 90 Days)

If the repository was deleted more than 90 days ago, you'll need to contact GitHub Support.

#### Steps:

1. **Visit GitHub Support Page**
   - Go to https://support.github.com/contact

2. **Submit Recovery Request**
   - Select "Account and Profile"
   - In the description, include:
     - Organization name: `root-gov-dev`
     - Repository name: `ops-core-root-system`
     - Approximate deletion date
     - Reason for recovery

3. **Wait for Response**
   - GitHub Support typically responds within 24-48 hours
   - They may request additional verification information

---

### Method 3: Restore from Local Clone or Backup

If you or a team member has a local clone of the repository, you can push it to a newly created repository.

#### Steps:

1. **Find Local Repository Clone**
   ```bash
   # Check for local clones
   find ~ -type d -name "ops-core-root-system" 2>/dev/null
   ```

2. **Create New Repository**
   - Visit https://github.com/organizations/root-gov-dev/repositories/new
   - Repository name: `ops-core-root-system`
   - Choose appropriate visibility (public/private)
   - Do NOT initialize with README, .gitignore, or license
   - Click "Create repository"

3. **Push Local Clone to New Repository**
   ```bash
   cd /path/to/local/ops-core-root-system
   
   # Update remote URL
   git remote set-url origin https://github.com/root-gov-dev/ops-core-root-system.git
   
   # Push all branches and tags
   git push -u origin --all
   git push -u origin --tags
   ```

4. **Restore Repository Settings**
   - Manually configure branch protection rules
   - Re-add collaborators
   - Configure webhooks and integrations
   - Restore GitHub Actions secrets

---

### Method 4: Recover from Other Team Members' Clones

If you don't have a local clone but other team members do:

1. **Contact Team Members**
   - Ask if they have a local clone of `ops-core-root-system`
   - Have them run `git remote -v` to verify the remote URL

2. **Obtain Repository Copy**
   - They can create a bundle:
     ```bash
     cd ops-core-root-system
     git bundle create ops-core-root-system.bundle --all
     ```
   - Send the bundle file to you

3. **Restore from Bundle**
   ```bash
   # Create new directory
   mkdir ops-core-root-system
   cd ops-core-root-system
   
   # Clone from bundle
   git clone ops-core-root-system.bundle .
   
   # Add new remote
   git remote add origin https://github.com/root-gov-dev/ops-core-root-system.git
   
   # Push everything
   git push -u origin --all
   git push -u origin --tags
   ```

---

## 🛡️ Prevention Measures

To prevent similar incidents in the future, consider implementing the following measures:

### 1. Enable Branch Protection
- Enable branch protection rules on important repositories
- Require at least one reviewer approval before merging

### 2. Regular Backups
Set up an automated backup strategy:

```bash
#!/bin/bash
# Backup script example
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d)

# Clone repository with all branches
git clone --mirror https://github.com/root-gov-dev/ops-core-root-system.git \
  "$BACKUP_DIR/ops-core-root-system-$DATE"

# Create compressed archive
cd "$BACKUP_DIR"
tar -czf "ops-core-root-system-$DATE.tar.gz" "ops-core-root-system-$DATE"
rm -rf "ops-core-root-system-$DATE"
```

### 3. Use Organization-Level Permission Control
- Limit users who can delete repositories
- Configure member permissions in organization settings
- Use teams to manage access rights

### 4. Configure GitHub Actions Backup
Create an automated backup workflow:

```yaml
name: Repository Backup
on:
  schedule:
    - cron: '0 2 * * 0'  # Every Sunday at 2 AM
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

### 5. Document Important Repositories
Maintain a list of critical repositories in the main repository:

```markdown
# Organization Repository Inventory

## Core Repositories
- `root-gov-dev` - Main governance module testing platform
- `ops-core-root-system` - Operations core root system
- `app` - Application subsystem

## Backup Locations
- GitHub Actions artifacts
- Local backups: /path/to/backups
- Off-site backups: [Cloud storage location]
```

---

## 📞 Need Help?

If none of the above methods work, please:

1. **Check Organization Audit Log**
   - Visit https://github.com/organizations/root-gov-dev/settings/audit-log
   - Search for deletion events related to `ops-core-root-system`
   - Confirm the exact time and who performed the deletion

2. **Contact GitHub Premium Support** (if you have GitHub Team or Enterprise plan)
   - Provide detailed repository information
   - Explain business impact
   - Request priority handling

3. **Check Related Integrations and Services**
   - Check CI/CD services (e.g., GitHub Actions)
   - Check backup services (e.g., BackHub, Rewind)
   - Check mirror services (e.g., GitLab mirrors)

---

## ✅ Post-Recovery Checklist

After recovering the repository, verify:

- [ ] All branches have been restored
- [ ] Tags and releases are complete
- [ ] Commit history is correct
- [ ] Repository settings (visibility, features) are correct
- [ ] Branch protection rules have been reconfigured
- [ ] Collaborator permissions have been restored
- [ ] Webhooks and integrations have been reset
- [ ] GitHub Actions secrets have been re-added
- [ ] README and documentation are complete
- [ ] Issues and Pull Requests have been restored (if any)

---

## 📚 Related Resources

- [GitHub Docs: Restoring a Deleted Repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/restoring-a-deleted-repository)
- [GitHub Docs: Deleting a Repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/deleting-a-repository)
- [GitHub Support](https://support.github.com)

---

**Last Updated:** 2025-11-07  
**Version:** 1.0
