# Security Policy

## Reporting Security Vulnerabilities

If you discover a potential security vulnerability in this SDK, please report it responsibly.

- **How to report**: Please use GitHub Private Vulnerability Reporting on this repository, or contact the repository maintainer privately.
- **Do not disclose publicly**: Please do not open a public GitHub issue or discussion for suspected security vulnerabilities until a fix has been released.
- **Never share API tokens**: When reporting an issue or providing reproduction steps, **never** include your live `WHAPI_TOKEN`, session credentials, phone numbers, or private message payloads.

## Best Practices for SDK Users

1. **Keep Secrets Secure**: Never commit API tokens, `.env` files, or production credentials to version control. Use environment variables, secret managers (such as AWS Secrets Manager, Vault, or GCP Secret Manager), or container environment secrets.
2. **Rotate Leaked Tokens**: If a Whapi.Cloud token is accidentally exposed, immediately revoke and regenerate it via the [Whapi.Cloud Dashboard](https://panel.whapi.cloud).
3. **Session & Linked Devices**: Whapi.Cloud operates as a linked WhatsApp Web session. Long-running production applications should monitor channel status via `whapi.health.check()` and handle potential session disconnects or re-authentication requirements.
4. **Rate Limiting & Account Protection**: WhatsApp monitors messaging velocity and patterns. Ensure appropriate rate limits, opt-in consent for recipients, and avoid spam-like behavior to prevent WhatsApp account bans or restrictions.
5. **Integration Tests**: Live integration tests require a real `WHAPI_TOKEN` and can send real messages to WhatsApp. Run live tests only in isolated test channels and never with production channels.
