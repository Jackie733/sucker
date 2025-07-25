# NPM Publishing Guide

This guide explains how to publish the Sucker Framework to npm.

## Prerequisites

1. **npm account**: Create an account at [npmjs.com](https://www.npmjs.com)
2. **npm login**: Authenticate with npm from your terminal
3. **Build the project**: Ensure TypeScript compilation is successful

## Steps to Publish

### 1. Authenticate with npm

```bash
npm login
```

Enter your npm username, password, and email when prompted.

### 2. Verify package configuration

Check that package.json has correct settings:

- `name`: "@jackie733/sucker" (scoped package)
- `version`: "0.1.0" (semantic versioning)
- `main`: "dist/index.js" (entry point)
- `types`: "dist/index.d.ts" (TypeScript definitions)

### 3. Build the project

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### 4. Test the package locally (optional)

```bash
# Create a tarball and inspect contents
npm pack

# Test installation locally
npm install -g ./jackie733-sucker-framework-0.1.0.tgz
```

### 5. Publish to npm

For first-time publishing of a scoped package:

```bash
npm publish --access public
```

For subsequent updates:

```bash
npm publish
```

### 6. Verify publication

Check your package at: https://www.npmjs.com/package/@jackie733/sucker-framework

## Version Management

Update version before publishing:

```bash
# Patch version (0.1.0 -> 0.1.1)
npm version patch

# Minor version (0.1.0 -> 0.2.0)
npm version minor

# Major version (0.1.0 -> 1.0.0)
npm version major
```

This automatically updates package.json and creates a git tag.

## Automated Publishing (CI/CD)

For automated publishing, add to your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm test
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Package Stats

Current package information:

- **Package size**: ~18.8 kB (compressed)
- **Unpacked size**: ~74.1 kB
- **Files included**: 32 files
- **TypeScript definitions**: ✅ Included
- **Source maps**: ✅ Included

## Troubleshooting

### Common Issues

1. **403 Forbidden**:
   - Ensure you're logged in: `npm whoami`
   - Check package name doesn't already exist
   - Verify you have publish rights to the scope

2. **Package name taken**:
   - Choose a different name or scope
   - Use scoped packages: `@username/package-name`

3. **Build errors**:
   - Run `npm run build` to check TypeScript compilation
   - Fix any TypeScript errors before publishing

### Useful Commands

```bash
# Check who you're logged in as
npm whoami

# Check package info
npm info @jackie733/sucker-framework

# List your published packages
npm ls --depth=0

# Unpublish (within 24 hours)
npm unpublish @jackie733/sucker-framework@0.1.0
```

## Next Steps

After publishing:

1. Add CI/CD pipeline for automated testing and publishing
2. Set up semantic release for automatic versioning
3. Create comprehensive documentation
4. Add more examples and tutorials
5. Monitor package downloads and usage

## Resources

- [npm Documentation](https://docs.npmjs.com/)
- [Semantic Versioning](https://semver.org/)
- [TypeScript Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)
