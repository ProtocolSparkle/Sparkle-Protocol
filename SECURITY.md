# Security policy

## Report a vulnerability privately

Email **security@sparkleprotocol.com** with the affected commit or package version, reproduction steps, impact, and relevant logs with secrets removed. Do not publish an exploitable vulnerability in a public issue. Coordinate disclosure with the maintainers so a fix can be prepared.

This policy covers the protocol design, SDK implementation, transaction construction, and integration vulnerabilities. Do not include private keys, seed phrases, node credentials, or unspent payment preimages in a report.

## Current assurance level

The SDK is unaudited and includes incomplete integration paths. Passing tests, a clean dependency audit, and a confirmed mainnet proof cover different properties; none is a general security certification. Read [readiness](docs/READINESS.md) and [implementation notes](docs/SPECIFICATION.md) before using funds.

## Integration responsibilities

- Verify actual funding outputs, unspent status, confirmations, the complete reconstructed Taproot contract, and inscription satpoints before paying or signing.
- Use a fully validating Lightning implementation for invoices and HTLC state. A payment-hash match is insufficient on its own.
- Review Bitcoin timelocks alongside Lightning expiry/HTLC deadlines, monitoring, fee escalation, and recovery. Historical short-window recommendations are superseded by the current implementation notes.
- Keep preimages unique and secret until the selected protocol flow requires disclosure. Never log production secrets.
- Keep private keys under appropriate signing controls. The low-level builders explicitly accept private keys; integrations must review how those keys are obtained and handled.

The deterministic keys in automated tests and examples are public fixtures and must never receive funds.
