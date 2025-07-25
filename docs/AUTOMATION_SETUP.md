# GitHub Actions Auto-Publish Setup Guide

This guide will help you set up automated publishing from GitHub to npm.

## 🔧 Prerequisites

### 1. npm Access Token (NPM_TOKEN)

First, you need to create an npm access token:

1. Log in to [npmjs.com](https://www.npmjs.com)
2. Click your avatar → **Access Tokens**
3. Click **Generate New Token**
4. Select **Automation** type
5. Copy the generated token

### 2. Set up GitHub Secrets

Configure secrets in your GitHub repository:

1. Go to your GitHub repository page
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secret:
   - **Name**: `NPM_TOKEN`
   - **Value**: The access token you copied from npm

## 🚀 Workflow Description

We've created 3 workflow files:

### 1. `ci-cd.yml` - Main CI/CD Pipeline

- **Triggers**: Push to main/master branch, PR creation, Release creation
- **Features**:
  - Test on multiple Node.js versions
  - Run code checks and builds
  - Automatically publish to npm when GitHub Release is created

### 2. `auto-publish.yml` - Automatic Version Publishing

- **Triggers**: Version number changes in package.json
- **Features**:
  - Detect version changes
  - Automatically create git tags
  - Publish to npm
  - Create GitHub Release

### 3. `manual-release.yml` - Manual Publishing

- **Triggers**: Manual trigger
- **Features**:
  - Manually select version type (patch/minor/major) via GitHub interface
  - Automatically update version number
  - Publish to npm

## 📋 Usage Methods

### Method 1: Automatic Version Publishing (Recommended)

1. **Update version number**:

   ```bash
   # Patch version (0.1.0 → 0.1.1)
   npm version patch

   # Minor version (0.1.0 → 0.2.0)
   npm version minor

   # Major version (0.1.0 → 1.0.0)
   npm version major
   ```

2. **Push to GitHub**:

   ```bash
   git push origin main
   ```

3. **Auto-execute**: GitHub Actions automatically publishes after detecting version changes

### Method 2: GitHub Release Publishing

1. **Create Release on GitHub**:
   - Go to repository page
   - Click **Releases** → **Create a new release**
   - Enter tag version (e.g., `v0.1.1`)
   - Fill in release notes
   - Click **Publish release**

2. **Auto-execute**: Publishing is automatically triggered after creating Release

### Method 3: Manual Publishing

1. **Trigger workflow**:
   - Go to GitHub repository
   - Click **Actions** → **Manual Release**
   - Click **Run workflow**
   - Select version type and whether to publish to npm

## 🔍 Monitoring and Debugging

### View Workflow Status

- Check all workflow run status in the **Actions** tab of your GitHub repository
- Click specific workflows to view detailed logs

### Common Issues

1. **NPM_TOKEN Invalid**:
   - Check if token is correctly set
   - Confirm token type is **Automation**
   - Check if token has publishing permissions

2. **Version Conflicts**:
   - Ensure version number in package.json is new
   - Check if same version already exists on npm

3. **Permission Issues**:
   - Confirm GitHub Actions has push permissions
   - Check branch protection rules

## 🎯 Best Practices

1. **Use Semantic Versioning**: Follow [Semantic Versioning](https://semver.org/)
2. **Write Changelog**: Record changes for each release
3. **Testing**: Ensure all tests pass before publishing
4. **Rollback Plan**: Prepare version rollback strategy

## 📊 Publishing Flow Chart

```text
Code Changes → git push → GitHub Actions Detection
    ↓
Version Check → Build & Test → Create Tags
    ↓
Publish to npm → Create GitHub Release → Completion Notification
```

After setup is complete, you only need to focus on code development - version publishing will be fully automated! 🎉
