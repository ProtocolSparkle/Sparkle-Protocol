# Contributing to Sparkle Protocol

Thank you for your interest in contributing to Sparkle Protocol! This document provides guidelines for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

1. Check if the issue already exists in [GitHub Issues](https://github.com/ProtocolSparkle/Sparkle-Protocol/issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node.js version, etc.)

### Suggesting Features

1. Open a [GitHub Issue](https://github.com/ProtocolSparkle/Sparkle-Protocol/issues) with the `enhancement` label
2. Describe the feature and its use case
3. Explain why it would benefit the protocol

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes following our coding standards
4. Write/update tests as needed
5. Ensure all tests pass: `npm test`
6. Commit with clear messages: `git commit -m "feat: add new feature"`
7. Push to your fork: `git push origin feature/your-feature`
8. Open a Pull Request

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: resolve bug in swap logic
docs: update README
test: add unit tests for core module
refactor: improve code structure
```

## Development Setup

```bash
# Clone the repo
git clone https://github.com/ProtocolSparkle/Sparkle-Protocol.git
cd Sparkle-Protocol

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

## Coding Standards

- **TypeScript**: All code must be TypeScript with strict mode
- **Formatting**: Use consistent formatting (consider Prettier)
- **Documentation**: Document public APIs with JSDoc comments
- **Testing**: Write tests for new functionality
- **Security**: Follow security best practices for cryptographic code

## Security Vulnerabilities

For security issues, please see [SECURITY.md](SECURITY.md) for responsible disclosure guidelines.

## Questions?

Open a [Discussion](https://github.com/ProtocolSparkle/Sparkle-Protocol/discussions) or reach out to the maintainers.

---

Thank you for contributing to trustless Bitcoin trading!
