# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-09-04

### Added

- Core Whapi client with Bearer authentication, configurable timeouts, AbortSignal support, and secret redaction.
- Custom error hierarchy (`WhapiError`, `WhapiApiError`, `WhapiValidationError`, `WhapiTimeoutError`, `WhapiNetworkError`, `WhapiRateLimitError`).
- Safe retry policy with exponential backoff, jitter, `Retry-After` header handling, and safe GET-only defaults (unsafe POST retries disabled by default).
- Channels / Newsletters resource (`list`, `get`, `create`, `update`, `delete`, `subscribe`, `unsubscribe`, `find`, `getRecommended`, `getPosts`, `iteratePosts`, `track`, `markPaidPartnership`).
- Channel publishing methods: `publishText`, `publishImage`, `publishVideo`, `publishLink`, `publishVoice`, `publishPoll`, `publishQuestion`, `publishQuiz`, and high-level `publish`.
- Messages resource for full messaging functionality (`sendText`, `sendImage`, `sendVideo`, `sendShortVideo`, `sendGif`, `sendAudio`, `sendVoice`, `sendDocument`, `sendLinkPreview`, `sendLocation`, `sendLiveLocation`, `sendContact`, `sendPoll`, `sendQuestion`, `sendQuiz`, `list`, `listByChat`, `get`, `delete`, and dispatcher `send`).
- Media resource for uploading files and retrieving uploaded media metadata.
- Settings and Webhook resources for channel settings and webhook testing.
- High-level `NewsPublisher` for publishing articles from WordPress and other CMS platforms with UTM tracking and automatic image/text fallback.
- Text formatting and Unicode-safe truncation helper preserving word boundaries.
- Raw API request escape hatch (`whapi.raw.request`).
- Complete automated unit and mock test suite.
- Comprehensive English and Ukrainian documentation (`README.md`, `README.uk.md`, `docs/API.en.md`, `docs/API.uk.md`).
