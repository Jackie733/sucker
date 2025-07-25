# Oxlint Configuration Guide

## About Oxlint

Oxlint is an ultra-fast JavaScript/TypeScript code checker written in Rust, featuring:

- ⚡ **Extremely Fast**: 50-100x faster than ESLint
- 🛠️ **Zero Configuration**: Out-of-the-box with sensible default rules
- 📝 **Native TypeScript Support**: Directly parses TypeScript code
- 🔧 **Auto-fix**: Supports automatic fixing of most issues
- 🎯 **ESLint Compatible**: Supports most ESLint rules

## Configuration Files

### Main Configuration (oxlint.json)

```json
{
  "rules": {
    "correctness": "error", // Obviously incorrect code
    "suspicious": "error", // Suspicious or potentially incorrect code
    "perf": "warn", // Performance-related issues
    "style": "warn", // Code style issues
    "pedantic": "off", // Strict but occasionally false-positive rules
    "nursery": "off", // New rules in development
    "restriction": "off" // Restrictive rules
  },
  "allow": [
    "no-console" // Allow console.log etc.
  ],
  "deny": [
    "no-unused-vars", // Disallow unused variables
    "no-undef" // Disallow undefined variables
  ],
  "ignore": [
    "dist/**/*", // Ignore build output
    "node_modules/**/*", // Ignore dependencies
    "**/*.js", // Ignore JS files
    "**/*.d.ts" // Ignore type definition files
  ]
}
```

## Usage Methods

### Basic Commands

```bash
# Check code
npm run lint                # Use oxlint to check
npx oxlint src/            # Use oxlint directly

# Auto-fix
npm run lint:fix           # Auto-fix issues
npx oxlint --fix src/      # Use auto-fix directly

# View configuration
npx oxlint --print-config  # Show current configuration

# List all rules
npx oxlint --rules         # Show all available rules
```

### Advanced Usage

```bash
# Enable plugins
npx oxlint --react-plugin --typescript-plugin src/

# Custom rules
npx oxlint -D correctness -A no-console src/

# Specify configuration file
npx oxlint -c ./custom-oxlint.json src/

# Output formats
npx oxlint --format json src/     # JSON format output
npx oxlint --format github src/   # GitHub Actions format
```

## Comparison with ESLint

| Feature                  | Oxlint            | ESLint          |
| ------------------------ | ----------------- | --------------- |
| Speed                    | 🚀 Extremely fast | 🐌 Slower       |
| Configuration complexity | 🟢 Simple         | 🟡 Complex      |
| Plugin ecosystem         | 🟡 Limited        | 🟢 Rich         |
| TypeScript support       | 🟢 Native         | 🟡 Needs config |
| Auto-fix                 | 🟢 Built-in       | 🟢 Supported    |

## Migration Recommendations

### Option 1: Complete ESLint Replacement

- Fastest performance
- Simplest configuration
- Suitable for new projects or projects with minimal ESLint plugin dependencies

### Option 2: Dual Linter Strategy

- Use Oxlint for fast daily checks
- Keep ESLint for CI/CD or special rules
- Suitable for large projects or projects with complex ESLint configurations

### Option 3: Progressive Migration

- Start using Oxlint in development environment
- Gradually reduce dependency on ESLint
- Suitable for teams with cautious migration approach

## Best Practices

1. **Development Phase**: Use Oxlint for quick checks
2. **Before Commits**: Run `npm run check` for comprehensive checks
3. **CI/CD**: Can run both linters simultaneously to ensure compatibility
4. **Team Collaboration**: Unified configuration files to ensure consistent rules

## Common Issues

### Q: Oxlint cannot auto-fix certain issues

A: Oxlint's auto-fix functionality is still being improved, can be used together with Prettier

### Q: How to handle rules not supported by Oxlint

A: Can keep ESLint for special rules, or wait for Oxlint updates

### Q: How does performance compare

A: In our project, Oxlint checks 6 files in 13ms, significantly better than ESLint

## Change Log

- v1.8.0: Currently used version, supports most common rules
- Future versions will continue to add rule support and auto-fix capabilities
