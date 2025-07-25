# 🚀 Quick Setup for GitHub Auto-Publishing

## Step 1: Set up npm Token

1. **Get npm token**:

   ```bash
   # Log in to npm (if not already logged in)
   npm login

   # Or on npmjs.com website:
   # 1. Log in to npmjs.com
   # 2. Avatar → Access Tokens → Generate New Token
   # 3. Select "Automation" type
   # 4. Copy the token
   ```

2. **Set secret in GitHub**:
   - Go to your GitHub repository
   - Settings → Secrets and variables → Actions
   - New repository secret:
     - Name: `NPM_SUCKER_TOKEN`
     - Secret: Paste your npm token

## Step 2: Push Workflow Files to GitHub

```bash
# Add all files to git
git add .

# Commit changes
git commit -m "feat: add GitHub Actions auto-publish workflows with pnpm support"

# Push to GitHub
git push origin main
```

## Step 3: Test Auto-Publishing

### Method 1: Automatic Version Publishing (Recommended)

```bash
# Update patch version (0.1.0 → 0.1.1)
pnpm run release:patch

# Or update minor version (0.1.0 → 0.2.0)
pnpm run release:minor

# Or update major version (0.1.0 → 1.0.0)
pnpm run release:major
```

This will:

- Automatically update version number in package.json
- Create git tags
- Push to GitHub
- Trigger automatic publishing to npm

### Method 2: Manual Trigger on GitHub

1. Go to GitHub repository page
2. Click "Actions" tab
3. Select "Manual Release" workflow
4. Click "Run workflow"
5. Select version type (patch/minor/major)
6. Click "Run workflow"

## 🎯 Verify Setup

1. **Check GitHub Actions**:
   - View workflow run status in repository's Actions tab
   - Ensure all workflows run successfully

2. **Check npm publishing**:

   ```bash
   # Check latest version
   npm view @jackie733/sucker version

   # Or visit npm page
   # https://www.npmjs.com/package/@jackie733/sucker
   ```

3. **Test installation**:
   ```bash
   # Test installation in new directory
   mkdir test-install && cd test-install
   pnpm init
   pnpm install @jackie733/sucker
   ```

## 📋 Workflow Description

We've set up 3 automation workflows:

1. **`ci-cd.yml`** - Main continuous integration/deployment
   - Run tests on every push and PR
   - Auto-publish when Release is created

2. **`auto-publish.yml`** - Auto-publish on version changes
   - Detect package.json version changes
   - Automatically create tags and publish

3. **`manual-release.yml`** - Manual publishing control
   - Manual trigger via GitHub interface
   - Choose version type and publishing options

## 🔧 Daily Usage Workflow

```bash
# 1. Develop new features
git checkout -b feature/new-feature
# ... develop code ...
git commit -m "feat: add new feature"

# 2. Merge to main branch
git checkout main
git merge feature/new-feature

# 3. Release new version
pnpm run release:patch  # Auto-update version and publish

# 4. Verify release
pnpm view @jackie733/sucker version
```

## 🎉 Complete!

Now your framework has a complete automated publishing pipeline:

- ✅ Code quality checks
- ✅ Automated testing
- ✅ Version management
- ✅ npm auto-publishing
- ✅ GitHub Release creation

Every time you update the version number and push to GitHub, it will automatically publish to npm!
