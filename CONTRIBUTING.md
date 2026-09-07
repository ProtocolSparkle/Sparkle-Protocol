# Contributing

Use issues for reproducible bugs and proposed changes. Include the commit or package version, operating system, Node version, expected behavior, and reproduction steps. Report exploitable vulnerabilities privately through [SECURITY.md](SECURITY.md).

## Development

Use Node.js 22.12 or newer. CI checks Node 22 and 24 on Linux and Node 22 on Windows.

```sh
git clone https://github.com/ProtocolSparkle/Sparkle-Protocol.git
cd Sparkle-Protocol
npm ci --ignore-scripts
npm run check
npm audit --audit-level=low
```

Commit `package-lock.json` whenever dependencies change. Use `npm run test:watch` for interactive development. The automated suite is offline; it never pays invoices or broadcasts transactions. The manual test guides under `tests/` are historical integration procedures and are not executed by CI.

## Pull requests

1. Create a branch for a coherent change.
2. Keep TypeScript strict and document public API behavior.
3. Add meaningful regression coverage when changing protocol or transaction behavior.
4. Run the checks above and describe their results and any limitations.
5. Review the diff for accidental credentials, keys, wallet data, and unrelated changes.
6. Open a pull request explaining the problem and resulting behavior.

Preserve published proof files byte for byte. Add a new dated record when evidence changes; do not rewrite a prior completion snapshot. Keep proof claims separate from automated test results and audit claims.

## Releases

The current development version is `1.0.2-dev.0`. The npm 1.0.1 release and its registry artifact remain unchanged. Before a future release, choose the version, update the package and public SDK version together, build and inspect the package, document compatibility changes, and obtain the required release review. Publishing the repository does not publish to npm or deploy the website.

Maintain respectful, constructive communication in issues and reviews. Code and documentation contributions follow the repository's MIT license.
