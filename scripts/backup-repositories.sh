#!/bin/bash
# Repository Backup Script for root-gov-dev Organization
# This script creates backups of important repositories

set -e

# Configuration
ORG_NAME="root-gov-dev"
BACKUP_BASE_DIR="${BACKUP_DIR:-$HOME/github-backups}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$BACKUP_BASE_DIR/$DATE"

# List of critical repositories to backup
REPOS=(
    "root-gov-dev"
    "ops-core-root-system"
    "app"
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "================================================"
echo "GitHub Repository Backup Script"
echo "Organization: $ORG_NAME"
echo "Backup Location: $BACKUP_DIR"
echo "Date: $(date)"
echo "================================================"
echo

# Create backup directory
mkdir -p "$BACKUP_DIR"
cd "$BACKUP_DIR"

# Function to backup a repository
backup_repo() {
    local repo_name=$1
    local repo_url="https://github.com/${ORG_NAME}/${repo_name}.git"
    
    echo -e "${YELLOW}Backing up: ${repo_name}${NC}"
    
    # Clone with mirror (includes all branches, tags, and refs)
    if git clone --mirror "$repo_url" "${repo_name}.git" 2>/dev/null; then
        echo -e "${GREEN}✓ Successfully cloned ${repo_name}${NC}"
        
        # Create a bundle file (portable backup)
        cd "${repo_name}.git"
        if git bundle create "../${repo_name}.bundle" --all; then
            echo -e "${GREEN}✓ Created bundle for ${repo_name}${NC}"
        else
            echo -e "${RED}✗ Failed to create bundle for ${repo_name}${NC}"
        fi
        cd ..
        
        # Create compressed archive
        if tar -czf "${repo_name}.tar.gz" "${repo_name}.git"; then
            echo -e "${GREEN}✓ Created archive for ${repo_name}${NC}"
            # Remove the .git directory to save space (only after successful archive)
            rm -rf "${repo_name}.git"
        else
            echo -e "${RED}✗ Failed to create archive for ${repo_name}${NC}"
            echo -e "${YELLOW}  Keeping .git directory for manual recovery${NC}"
        fi
    else
        echo -e "${RED}✗ Failed to clone ${repo_name}${NC}"
        echo -e "${RED}  Repository may not exist or is not accessible${NC}"
    fi
    
    echo
}

# Backup each repository
for repo in "${REPOS[@]}"; do
    backup_repo "$repo"
done

# Create a manifest file
cat > "backup_manifest.txt" << EOF
GitHub Repository Backup
Organization: $ORG_NAME
Date: $(date)
Backup Directory: $BACKUP_DIR

Backed up repositories:
EOF

for repo in "${REPOS[@]}"; do
    if [ -f "${repo}.tar.gz" ] || [ -f "${repo}.bundle" ]; then
        echo "  ✓ $repo" >> "backup_manifest.txt"
    else
        echo "  ✗ $repo (FAILED)" >> "backup_manifest.txt"
    fi
done

# Calculate total backup size
total_size=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "unknown")

cat >> "backup_manifest.txt" << EOF

Total Backup Size: $total_size

Files:
EOF

ls -lh "$BACKUP_DIR" >> "backup_manifest.txt"

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Backup Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo "Location: $BACKUP_DIR"
echo "Total Size: $total_size"
echo
echo "To restore from a bundle:"
echo "  git clone <repo-name>.bundle <directory>"
echo
echo "To extract an archive:"
echo "  tar -xzf <repo-name>.tar.gz"
echo

# Optionally clean up old backups (keep last 30 days)
if [ "${CLEANUP_OLD_BACKUPS:-false}" = "true" ]; then
    echo "Cleaning up backups older than 30 days..."
    find "$BACKUP_BASE_DIR" -maxdepth 1 -type d -mtime +30 -exec rm -rf {} \;
    echo -e "${GREEN}✓ Cleanup complete${NC}"
fi
