# AI Agent Task — `whapi-node-sdk`

## 1. Project name

**Recommended repository/project name:** `whapi-node-sdk`

Recommended package name for a private or public npm scope:

```text
@your-scope/whapi-sdk
```

If an unscoped npm package is required, check npm availability before choosing a final package name. Do not assume that `whapi-node-sdk` or `whapi-sdk` is available.

The project must clearly state that it is an **unofficial/community SDK for Whapi.Cloud** and is not an official Whapi.Cloud or Meta/WhatsApp SDK unless explicit permission/ownership exists.

---

# 2. Task for the AI agent

You are a senior Node.js library engineer.

Your task is to design, implement, test, and document a production-ready **JavaScript SDK for Whapi.Cloud REST API**, with a strong focus on WhatsApp Channels / Newsletters and message publishing.

The SDK must make Whapi.Cloud easy to use from Node.js applications without forcing developers to manually write `fetch`/`axios` requests, construct endpoints, repeat Bearer authorization, handle common errors, normalize channel IDs, or implement repetitive publishing logic.

The initial use case is:

> A news website publishes an article in WordPress, then a Node.js service automatically publishes the article title, description, image, and URL to a WhatsApp Channel through Whapi.Cloud.

However, the SDK architecture must not be limited to this one use case.

The SDK should be reusable in:

- Node.js applications;
- WordPress integration microservices;
- news publishing systems;
- Telegram/WhatsApp cross-posting services;
- n8n custom code/functions;
- cron workers;
- notification services;
- bots;
- internal company automation.

---

# 3. Technology requirements

Use:

- **Node.js 20+**
- **JavaScript**
- **ES Modules**
- JSDoc for types and IDE autocomplete
- native `fetch` where practical
- native `FormData`, `Blob`, `AbortController` where practical
- ESLint
- Prettier
- Node.js built-in test runner or another lightweight test framework if there is a clear reason
- GitHub Actions for CI

Do **not** use TypeScript for the SDK source code.

Do not introduce heavy dependencies unless they solve a real problem.

Prefer a small dependency footprint.

The code must work correctly on Node.js 20 and Node.js 22.

---

# 4. Critical rule: Whapi documentation is the source of truth

Before writing the implementation, inspect the **current Whapi.Cloud API documentation and OpenAPI specification**.

Primary references:

```text
https://whapi.cloud/docs
https://panel.whapi.cloud/yaml/openapi.yaml
https://whapi.cloud/changelog
https://whapi.cloud/how-to-automate-whatsapp-channels-api
```

At the time this task was created, Whapi documentation exposed API areas including:

- health/channel state;
- settings;
- users;
- messages;
- media;
- groups;
- communities;
- channels/newsletters;
- webhooks/events;
- statuses;
- contacts/chats and other WhatsApp functionality.

Whapi also documents WhatsApp Channel publishing through message endpoints with a recipient ID in the form:

```text
120363XXXXXXXXXXXX@newsletter
```

The API changes over time.

Therefore:

1. Inspect current OpenAPI before implementation.
2. Do not invent endpoints.
3. Do not rely only on examples in this task.
4. If this specification conflicts with current official Whapi documentation, follow current Whapi documentation.
5. Record the Whapi API/OpenAPI version and inspection date in the project documentation.
6. If a feature requested below no longer exists, document it as unavailable instead of faking support.
7. If Whapi added useful functionality since this task was written, it may be added if it fits the architecture.

---

# 5. Main SDK design

The public API should look approximately like this:

```js
import { Whapi } from '@your-scope/whapi-sdk';

const whapi = new Whapi({
  token: process.env.WHAPI_TOKEN,
});

const health = await whapi.health.check();

await whapi.channels.publishText(process.env.WHATSAPP_CHANNEL_ID, 'Hello from the SDK');
```

The SDK must expose one primary client:

```js
new Whapi(options);
```

Recommended options:

```js
const whapi = new Whapi({
  token: process.env.WHAPI_TOKEN,

  baseUrl: 'https://gate.whapi.cloud',

  timeout: 30_000,

  retry: {
    enabled: true,
    attempts: 3,
    minDelay: 500,
    maxDelay: 5_000,
  },

  logger: console,
});
```

The exact option names may be adjusted if the final design is cleaner, but the public API must remain simple.

---

# 6. Project structure

Use a clean modular structure similar to:

```text
whapi-node-sdk/
├── src/
│   ├── index.js
│   ├── Whapi.js
│   │
│   ├── core/
│   │   ├── HttpClient.js
│   │   ├── errors.js
│   │   ├── retry.js
│   │   ├── validation.js
│   │   ├── ids.js
│   │   └── logger.js
│   │
│   ├── resources/
│   │   ├── HealthResource.js
│   │   ├── SettingsResource.js
│   │   ├── MessagesResource.js
│   │   ├── ChannelsResource.js
│   │   ├── MediaResource.js
│   │   └── WebhooksResource.js
│   │
│   ├── helpers/
│   │   ├── NewsPublisher.js
│   │   ├── media.js
│   │   └── text.js
│   │
│   └── types/
│       └── typedefs.js
│
├── test/
│   ├── core/
│   ├── resources/
│   └── helpers/
│
├── examples/
│   ├── channel-text.js
│   ├── channel-image.js
│   ├── publish-article.js
│   ├── list-channel-posts.js
│   ├── send-private-message.js
│   └── webhook-example.js
│
├── docs/
│   ├── API.en.md
│   └── API.uk.md
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── .env.example
├── .gitignore
├── eslint.config.js
├── package.json
├── README.md
├── README.uk.md
├── CHANGELOG.md
├── LICENSE
└── SECURITY.md
```

The structure can be slightly changed if there is a clear architectural reason.

---

# 7. Core HTTP client

Create a reusable internal HTTP layer.

Responsibilities:

- base URL handling;
- Bearer authentication;
- JSON serialization;
- query parameters;
- multipart/form-data when required by Whapi;
- request timeout;
- response parsing;
- consistent error handling;
- safe retry behavior;
- optional logging;
- redaction of secrets;
- raw request escape hatch.

Example internal usage:

```js
this.http.request({
  method: 'POST',
  path: '/messages/text',
  body: {
    to,
    body,
  },
});
```

## Authentication

Automatically send:

```http
Authorization: Bearer WHAPI_TOKEN
```

Never include the token in logs or error messages.

Validate that a non-empty token is supplied.

Allow initialization without a token only if there is a real documented Whapi endpoint that does not require it. Otherwise fail fast.

---

# 8. Error model

Create SDK-specific error classes.

At minimum:

```text
WhapiError
WhapiApiError
WhapiValidationError
WhapiTimeoutError
WhapiNetworkError
WhapiRateLimitError
```

Suggested fields:

```js
{
  (name, message, code, status, method, endpoint, requestId, retryable, response, cause);
}
```

Example:

```js
try {
  await whapi.channels.publishText(channelId, text);
} catch (error) {
  if (error instanceof WhapiRateLimitError) {
    console.error(error.status);
  }
}
```

Do not expose the API token in serialized errors.

Keep the original Whapi response available where safe.

---

# 9. Retry policy

Retry logic must be conservative.

This is important because retrying a message-send request after an ambiguous network timeout may create duplicate WhatsApp posts.

Default behavior:

- retry safe/idempotent GET requests on temporary network/server errors;
- respect `Retry-After` when provided;
- use exponential backoff with jitter;
- classify HTTP 429 as rate limiting;
- classify HTTP 5xx as temporary where appropriate;
- do not retry normal 4xx errors;
- do not automatically retry message publishing POST requests when there is a possibility that the first request was accepted but the response was lost.

If Whapi currently supports an idempotency mechanism, request ID, tracking ID, or another documented duplicate-prevention mechanism, use it.

Otherwise unsafe retries must require an explicit option such as:

```js
retry: {
  retryUnsafeRequests: false,
}
```

Default must be `false`.

Document the duplicate-message risk.

---

# 10. Input validation

Add lightweight validation before sending obviously invalid requests.

Examples:

- token must be a non-empty string;
- channel ID must be valid enough to prevent accidental recipient mistakes;
- required text cannot be undefined;
- URLs must be strings/URL objects where appropriate;
- poll options must be a valid array;
- timeout must be positive;
- retry attempts must be sane.

Do not attempt to reimplement all server-side Whapi validation.

---

# 11. WhatsApp/Whapi ID helpers

Create helpers for channel IDs.

Example:

```js
normalizeChannelId('120363123456789');
```

may return:

```text
120363123456789@newsletter
```

If the ID already ends with:

```text
@newsletter
```

leave it unchanged.

Expose helpers only if useful:

```js
whapi.utils.normalizeChannelId(...)
```

or keep them internal and normalize automatically.

Do not silently transform arbitrary invalid strings.

---

# 12. Health resource

Public API:

```js
whapi.health.check();
```

It should wrap the current Whapi health endpoint.

Return the API response without unnecessary destructive normalization.

Example:

```js
const result = await whapi.health.check();
console.log(result);
```

---

# 13. Settings resource

Implement basic channel/session settings that are present in the current OpenAPI.

Expected API shape:

```js
whapi.settings.get()

whapi.settings.update({
  // documented settings only
})

whapi.settings.getEvents()

whapi.settings.testWebhook(...)
```

Only expose fields supported by the current Whapi specification.

Do not hardcode outdated settings schemas.

---

# 14. Messages resource

This is one of the main modules.

Implement convenient wrappers around the current message API.

Target public methods, where supported by current Whapi OpenAPI:

```js
whapi.messages.list(options);

whapi.messages.listByChat(chatId, options);

whapi.messages.sendText(to, text, options);

whapi.messages.sendImage(to, image, options);

whapi.messages.sendVideo(to, video, options);

whapi.messages.sendShortVideo(to, video, options);

whapi.messages.sendGif(to, gif, options);

whapi.messages.sendAudio(to, audio, options);

whapi.messages.sendVoice(to, audio, options);

whapi.messages.sendDocument(to, document, options);

whapi.messages.sendLinkPreview(to, url, options);

whapi.messages.sendLocation(to, location, options);

whapi.messages.sendLiveLocation(to, location, options);

whapi.messages.sendContact(to, contact, options);

whapi.messages.sendPoll(to, poll, options);

whapi.messages.sendQuestion(to, question, options);

whapi.messages.sendQuiz(to, quiz, options);
```

Implement only methods supported by the current API.

If current OpenAPI includes message editing, deletion, reactions, forwarding, quoting/replying, buttons, menus, products, orders, stickers, or other important message endpoints, inspect them and decide whether they belong in v1.

Priority is:

1. text;
2. image;
3. video;
4. link preview;
5. voice/audio;
6. document;
7. poll;
8. question;
9. quiz;
10. other useful current types.

---

# 15. Flexible message sending API

In addition to specialized methods, provide a high-level dispatcher:

```js
await whapi.messages.send({
  to: '...',
  type: 'text',
  text: 'Hello',
});
```

Examples:

```js
await whapi.messages.send({
  to: channelId,
  type: 'image',
  media: 'https://example.com/image.jpg',
  caption: 'News',
});
```

```js
await whapi.messages.send({
  to: channelId,
  type: 'poll',
  question: 'What do you think?',
  options: ['Good', 'Bad'],
});
```

The dispatcher must call the same underlying specialized methods.

Do not duplicate transport logic.

Unknown types must throw `WhapiValidationError`.

---

# 16. Media input

Design media handling carefully.

The SDK should support the media formats that Whapi currently documents.

Where possible and supported, make it convenient to provide:

```js
'https://example.com/image.jpg';
```

or:

```js
'/absolute/path/to/image.jpg';
```

or:

```js
Buffer;
```

or:

```js
Uint8Array;
```

Do not assume every endpoint accepts every representation.

The SDK must inspect the current Whapi API and use the correct strategy:

- remote URL;
- direct media field;
- base64;
- media upload endpoint;
- multipart upload;
- two-step upload;

whichever Whapi currently requires.

Implement the complexity internally where practical.

Example desired API:

```js
await whapi.messages.sendImage(to, {
  source: '/tmp/photo.jpg',
  caption: 'Hello',
});
```

or another cleaner equivalent.

Document supported input forms.

---

# 17. Channels / Newsletters resource

The public SDK terminology should be developer-friendly:

```js
whapi.channels;
```

Whapi internally may use the term `newsletters`.

The implementation must map the friendly SDK name to the current Whapi newsletter endpoints.

Optionally expose an alias:

```js
whapi.newsletters === whapi.channels;
```

only if this improves discoverability and does not make the API confusing.

Target methods, where currently supported:

```js
whapi.channels.list(options);

whapi.channels.get(channelId);

whapi.channels.create(data);

whapi.channels.update(channelId, data);

whapi.channels.delete(channelId);

whapi.channels.getPosts(channelId, options);

whapi.channels.getPost(channelId, messageId);
```

Additionally inspect current OpenAPI for support for:

- subscribe;
- unsubscribe;
- invite links/codes;
- recommended channels;
- admin invitations;
- admin removal;
- ownership;
- followers/subscribers;
- reactions;
- channel metadata;
- channel image/avatar;
- channel search/discovery.

Implement useful stable functionality if supported.

Do not invent unsupported operations.

---

# 18. Channel publishing helpers

Publishing to a WhatsApp Channel is a core feature.

Expose convenient channel-specific methods:

```js
whapi.channels.publishText(channelId, text, options);

whapi.channels.publishImage(channelId, image, options);

whapi.channels.publishVideo(channelId, video, options);

whapi.channels.publishLink(channelId, url, options);

whapi.channels.publishVoice(channelId, audio, options);

whapi.channels.publishPoll(channelId, poll, options);

whapi.channels.publishQuestion(channelId, question, options);

whapi.channels.publishQuiz(channelId, quiz, options);
```

Only include formats currently supported by Whapi for Channels.

These methods should internally delegate to `whapi.messages.*`.

Example:

```js
async publishText(channelId, text, options = {}) {
  const to = normalizeChannelId(channelId);

  return this.messages.sendText(to, text, options);
}
```

Do not duplicate HTTP requests between `channels` and `messages`.

---

# 19. Generic channel publish method

Create:

```js
whapi.channels.publish(channelId, payload);
```

Examples:

```js
await whapi.channels.publish(channelId, {
  type: 'text',
  text: 'Hello',
});
```

```js
await whapi.channels.publish(channelId, {
  type: 'image',
  media: 'https://example.com/photo.jpg',
  caption: 'Breaking news',
});
```

```js
await whapi.channels.publish(channelId, {
  type: 'poll',
  question: 'Your opinion?',
  options: ['Yes', 'No'],
});
```

This method should normalize the channel ID and delegate to `messages.send()`.

---

# 20. Channel post history and pagination

Implement:

```js
whapi.channels.getPosts(channelId, {
  count: 50,
  before,
  after,
});
```

Use the pagination parameters currently documented by Whapi.

Also create an async iterator if it can be done cleanly:

```js
for await (const post of whapi.channels.iteratePosts(channelId, {
  pageSize: 50,
})) {
  console.log(post);
}
```

The iterator must:

- stop correctly;
- avoid infinite loops;
- respect pagination;
- allow a maximum item count;
- not load an entire large history into memory.

Example:

```js
for await (const post of whapi.channels.iteratePosts(channelId, {
  pageSize: 50,
  limit: 500,
})) {
  // process post
}
```

---

# 21. High-level News Publisher

Create a high-level helper specifically for news websites.

Public API:

```js
whapi.news.publishArticle(...)
```

Example:

```js
const result = await whapi.news.publishArticle({
  channelId: process.env.WHATSAPP_CHANNEL_ID,

  title: 'Apple представила новый продукт',

  description: 'Компания официально показала новое устройство...',

  image: 'https://example.com/wp-content/uploads/article.jpg',

  url: 'https://example.com/news/apple-product',

  utm: {
    source: 'whatsapp',
    medium: 'channel',
    campaign: 'news',
  },
});
```

The helper should:

1. validate required fields;
2. normalize `channelId`;
3. optionally append UTM parameters;
4. safely preserve existing query parameters;
5. format a readable WhatsApp post;
6. avoid unnecessary blank lines;
7. use image publishing when an image exists;
8. fall back to text publishing when no image exists;
9. return the raw message result plus useful metadata;
10. avoid duplicate network logic.

Suggested return shape:

```js
{
  success: true,
  channelId: '120363...@newsletter',
  type: 'image',
  messageId: '...',
  url: 'https://example.com/...',
  response: { /* raw Whapi response */ }
}
```

Only populate `messageId` if Whapi actually returns one.

Never invent IDs.

---

# 22. Article formatting

Create an overridable/default formatter.

Default result:

```text
TITLE

DESCRIPTION

URL
```

Provide options such as:

```js
whapi.news.publishArticle({
  ...article,

  formatting: {
    includeDescription: true,
    includeUrl: true,
    maxDescriptionLength: 500,
  },
});
```

Implement a safe text truncation helper.

Do not cut a Unicode surrogate pair in the middle.

Prefer word-boundary truncation where practical.

Do not hardcode unsupported WhatsApp markup.

If formatting syntax is documented and used, keep it simple.

---

# 23. UTM helper

Implement a helper that safely adds UTM parameters.

Example:

```js
addUtm('https://example.com/news?id=123', {
  source: 'whatsapp',
  medium: 'channel',
  campaign: 'news',
});
```

Result conceptually:

```text
https://example.com/news?id=123&utm_source=whatsapp&utm_medium=channel&utm_campaign=news
```

Rules:

- preserve existing query parameters;
- use `URL`;
- do not manually concatenate strings;
- encode values correctly;
- skip undefined UTM values;
- support at least:
  - `source`;
  - `medium`;
  - `campaign`;
  - `term`;
  - `content`.

---

# 24. Raw API escape hatch

A library SDK should not block developers from accessing a new Whapi endpoint that the SDK has not wrapped yet.

Expose:

```js
whapi.raw.request({
  method: 'GET',
  path: '/some/new-endpoint',
  query: {},
  body: {},
});
```

It must use the same:

- authorization;
- timeout;
- error handling;
- response parsing;
- logging;
- retry policy.

Document that this is an advanced escape hatch.

---

# 25. Webhooks module

Implement only what is supported by the current Whapi API.

Potential public API:

```js
whapi.webhooks.getEvents();

whapi.webhooks.test(payload);
```

If webhook URL configuration belongs under channel/settings endpoints, use the real Whapi model rather than inventing a second API.

Create utilities for consuming webhook payloads only if useful:

```js
whapi.webhooks.parse(payload);
```

Do not implement cryptographic signature verification unless Whapi officially documents a signature or verification mechanism.

If it does, implement and test it.

---

# 26. Logging

Support optional logging.

Example:

```js
const whapi = new Whapi({
  token,
  logger: {
    debug(...args) {},
    info(...args) {},
    warn(...args) {},
    error(...args) {},
  },
});
```

Default:

- SDK should be quiet;
- no console spam.

Never log:

- API token;
- Authorization header;
- binary media;
- full sensitive request payloads by default.

Log request method/path/status/duration when debug logging is enabled.

---

# 27. AbortSignal support

Allow callers to cancel requests.

Example:

```js
const controller = new AbortController();

await whapi.messages.sendText(to, 'Hello', {
  signal: controller.signal,
});
```

The SDK's internal timeout and caller-provided `AbortSignal` must coexist correctly.

---

# 28. JSDoc and autocomplete

All public classes and methods must have JSDoc.

Example:

```js
/**
 * Publish a text post to a WhatsApp Channel.
 *
 * @param {string} channelId
 * @param {string} text
 * @param {PublishTextOptions} [options]
 * @returns {Promise<object>}
 */
async publishText(channelId, text, options = {}) {
  // ...
}
```

Define reusable typedefs in a centralized place where sensible.

Goal:

When a developer types:

```js
whapi.channels.
```

VS Code should provide useful autocomplete for:

```text
list
get
create
update
delete
getPosts
iteratePosts
publish
publishText
publishImage
publishVideo
publishLink
publishVoice
publishPoll
...
```

No TypeScript source is required.

---

# 29. Public exports

Keep exports intentional.

Example:

```js
export { Whapi } from './Whapi.js';

export {
  WhapiError,
  WhapiApiError,
  WhapiValidationError,
  WhapiTimeoutError,
  WhapiNetworkError,
  WhapiRateLimitError,
} from './core/errors.js';
```

Avoid exposing internal implementation classes unless useful.

---

# 30. Environment example

Create:

```env
WHAPI_TOKEN=
WHAPI_CHANNEL_ID=
```

Do not put real credentials in the repository.

`.gitignore` must include:

```text
.env
.env.*
!.env.example
node_modules
coverage
```

Adjust carefully so examples are not accidentally ignored.

---

# 31. Security requirements

The agent must follow these rules:

- never commit API tokens;
- never print API tokens in logs;
- redact `Authorization`;
- validate URLs used for SDK configuration;
- do not silently disable TLS verification;
- do not use `NODE_TLS_REJECT_UNAUTHORIZED=0`;
- do not execute downloaded files;
- do not use `eval`;
- do not accept arbitrary code callbacks from remote API responses;
- do not persist Whapi responses unless the caller explicitly does so;
- document the fact that Whapi.Cloud works through a linked-device/session gateway according to its own documentation;
- document that long-running production integrations should handle session disconnect/re-authorization states;
- document that sending behavior can affect WhatsApp account restrictions.

---

# 32. Tests

Create comprehensive automated tests.

Minimum categories:

## Core client

Test:

- token validation;
- base URL normalization;
- Authorization header;
- JSON body;
- query parameters;
- timeout;
- AbortSignal;
- 2xx parsing;
- empty response;
- non-JSON response if Whapi can return one;
- 400 error;
- 401 error;
- 404 error;
- 429 error;
- 500 error;
- network error;
- secret redaction.

## Retry

Test:

- GET retry on temporary error;
- exponential/backoff behavior without slowing tests unnecessarily;
- `Retry-After`;
- no retry for normal validation 4xx;
- no unsafe POST retry by default;
- explicit unsafe retry only when configured.

## Channel IDs

Test:

```text
120363123
120363123@newsletter
invalid
empty
null
```

## Messages

Test payload generation for:

- text;
- image;
- video;
- link preview;
- poll;
- question;
- quiz;
- other implemented types.

## Channels

Test:

- get/list;
- create/update/delete if available;
- post history pagination;
- publish delegates to message resource;
- `@newsletter` normalization.

## News publisher

Test:

- title + description + URL;
- image article;
- text-only article;
- UTM insertion;
- existing query parameters;
- Unicode;
- description truncation;
- missing title;
- missing URL;
- Whapi error propagation.

No test should send real WhatsApp messages by default.

Integration tests requiring a real Whapi token must be explicitly opt-in.

Example:

```bash
WHAPI_INTEGRATION_TESTS=1 npm run test:integration
```

---

# 33. Integration test safety

Never run live publishing tests automatically in CI.

If live tests exist:

- require explicit environment variable;
- use a test channel;
- mark them clearly;
- avoid repeated test posts;
- document that they can send real WhatsApp content.

---

# 34. Code quality

Required:

```bash
npm run lint
npm test
```

Both must pass.

Also add:

```bash
npm run format
npm run format:check
```

Recommended `package.json` scripts:

```json
{
  "scripts": {
    "test": "node --test",
    "test:watch": "node --test --watch",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

Adjust if a different testing tool is chosen.

---

# 35. CI

Create GitHub Actions workflow.

Run at least:

- Node.js 20;
- Node.js 22.

Steps:

```text
checkout
setup-node
npm ci
npm run lint
npm test
npm run format:check
```

Do not require `WHAPI_TOKEN` for normal CI.

---

# 36. Package metadata

`package.json` should contain sensible metadata.

Example concept:

```json
{
  "name": "@your-scope/whapi-sdk",
  "version": "0.1.0",
  "description": "Unofficial Node.js SDK for Whapi.Cloud",
  "type": "module",
  "main": "./src/index.js",
  "exports": {
    ".": "./src/index.js"
  },
  "engines": {
    "node": ">=20"
  }
}
```

Do not literally use `@your-scope` for a published package.

The final package name must be configured by the project owner.

---

# 37. Versioning

Use Semantic Versioning.

Initial development:

```text
0.1.0
```

Breaking API changes before `1.0.0` should still be recorded in `CHANGELOG.md`.

Prepare the project so it can later be published to npm, but do not publish automatically.

---

# 38. README documentation — English

Create a complete:

```text
README.md
```

in **English**.

It must contain:

1. project description;
2. unofficial SDK disclaimer;
3. features;
4. requirements;
5. installation;
6. getting Whapi token;
7. initialization;
8. health check;
9. sending a private text message;
10. publishing text to a WhatsApp Channel;
11. publishing image to a Channel;
12. publishing video;
13. publishing link preview;
14. polls/questions/quizzes if implemented;
15. `channels.publish()`;
16. `news.publishArticle()`;
17. UTM example;
18. channel post history;
19. pagination/async iterator;
20. media input formats;
21. error handling;
22. retry behavior and duplicate-post warning;
23. timeout;
24. AbortSignal;
25. logging;
26. raw requests;
27. webhooks;
28. environment variables;
29. security recommendations;
30. testing;
31. API version compatibility;
32. links to Whapi documentation;
33. license.

At the top provide a language switch:

```md
English | [Українська](./README.uk.md)
```

---

# 39. README documentation — Ukrainian

Create:

```text
README.uk.md
```

It must be a high-quality **Ukrainian** version of the English documentation.

It must not be a shortened summary.

Both language versions should document the same SDK functionality.

At the top:

```md
[English](./README.md) | Українська
```

Use natural Ukrainian technical terminology.

Do not translate:

- JavaScript identifiers;
- npm commands;
- class names;
- method names;
- environment variable names;
- API endpoint names;
- code.

---

# 40. API reference documentation

In addition to READMEs create:

```text
docs/API.en.md
docs/API.uk.md
```

These should document every public SDK method.

For every method include:

```text
Signature
Purpose
Parameters
Return value
Throws
Example
Notes
```

Example:

````md
## channels.publishText(channelId, text, options?)

Publishes a text post to a WhatsApp Channel.

### Parameters

- `channelId` — ...
- `text` — ...
- `options` — ...

### Returns

...

### Throws

...

### Example

```js
await whapi.channels.publishText(channelId, 'Hello');
```
````

````

The English and Ukrainian API references must cover the same methods.

---

# 41. Examples

Create executable examples.

## `examples/channel-text.js`

```js
import 'dotenv/config';
import { Whapi } from '../src/index.js';

const whapi = new Whapi({
  token: process.env.WHAPI_TOKEN,
});

const response = await whapi.channels.publishText(
  process.env.WHAPI_CHANNEL_ID,
  'Test post'
);

console.log(response);
````

Do not add `dotenv` as a runtime SDK dependency if it is only needed for examples.

It may be a dev dependency.

Create equivalent examples for:

```text
channel-image.js
publish-article.js
list-channel-posts.js
send-private-message.js
```

Add webhook example if supported.

---

# 42. News website integration example

Include a realistic example for a WordPress/news project.

Example service:

```js
async function publishWordPressPostToWhatsApp(post) {
  return whapi.news.publishArticle({
    channelId: process.env.WHAPI_CHANNEL_ID,

    title: post.title,

    description: post.excerpt,

    image: post.featuredImage,

    url: post.url,

    utm: {
      source: 'whatsapp',
      medium: 'channel',
      campaign: 'news',
    },
  });
}
```

Explain that the SDK itself must remain CMS-agnostic.

Do not add WordPress as an SDK dependency.

---

# 43. Result consistency

As much as practical, SDK methods should return the original Whapi API object.

Do not aggressively rename response fields because:

- Whapi may add new fields;
- developers may need undocumented/new fields;
- normalization can break compatibility.

High-level helpers may wrap the result:

```js
{
  response: rawResponse,
  ...
}
```

but must preserve access to the original Whapi response.

---

# 44. Unknown/new API fields

Do not reject unknown response fields.

When sending requests, only send documented properties or explicit passthrough `options` that are designed for advanced use.

Avoid an SDK that becomes unusable whenever Whapi adds a response field.

---

# 45. Compatibility metadata

Add a documentation section:

```text
Whapi API compatibility
```

Include:

- date Whapi docs were checked;
- OpenAPI version;
- SDK version;
- link to Whapi changelog.

Example:

```text
SDK version: 0.1.0
Whapi OpenAPI version checked: <detected version>
Checked on: <YYYY-MM-DD>
```

The agent must fill these values from the actual API documentation at implementation time.

Do not use placeholder values in the final completed repository.

---

# 46. CHANGELOG

Create `CHANGELOG.md`.

Initial entry:

```md
## 0.1.0

### Added

- core Whapi client;
- health;
- messages;
- WhatsApp Channels/newsletters;
- channel publishing;
- article publishing helper;
- errors;
- retries;
- tests;
- English documentation;
- Ukrainian documentation.
```

Adjust according to the actual implemented scope.

---

# 47. SECURITY.md

Create a small security file describing:

- how to report SDK vulnerabilities;
- never include Whapi tokens in reports;
- keep tokens in environment variables/secret managers;
- rotate leaked tokens;
- linked-device/session considerations;
- live integration tests may send real messages.

Do not invent a security email address.

Use a placeholder instruction such as GitHub private vulnerability reporting if the repository supports it, or tell the owner to configure a contact method before public release.

---

# 48. License

Use the license selected by the repository owner.

If no license was specified, use **MIT** for the initial implementation, unless there is a project-specific reason not to.

Do not copy Whapi proprietary code.

An SDK wrapper around documented HTTP endpoints must be independently implemented.

---

# 49. Non-goals for v1

Do not attempt to implement every Whapi endpoint in version `0.1.0`.

Do not build:

- GUI;
- admin panel;
- database;
- WordPress plugin;
- Telegram integration;
- queue server;
- scheduler;
- SaaS platform;
- authentication server;
- browser extension.

The initial SDK should focus on:

```text
core client
messages
channels/newsletters
media needed for messages
news publishing helper
basic settings/webhook support
errors
tests
documentation
```

The architecture should allow other Whapi modules to be added later.

---

# 50. Optional v2 modules

Design the architecture so future modules can be added:

```js
whapi.users;
whapi.chats;
whapi.contacts;
whapi.groups;
whapi.communities;
whapi.statuses;
whapi.labels;
whapi.calls;
whapi.products;
```

Do not implement them in v1 unless they are trivial and do not delay/complicate the core deliverable.

---

# 51. Implementation phases for the AI agent

Execute the work in this order.

## Phase 1 — Research

1. Inspect current Whapi docs.
2. Download/read current OpenAPI.
3. Record API version.
4. Identify exact endpoints needed by v1.
5. Identify current schemas for messages and newsletters.
6. Determine current media upload strategy.
7. Determine current webhook model.
8. Determine current pagination.
9. Check Whapi changelog for recent breaking/relevant changes.

Before coding, create a short internal implementation plan.

Do not stop after the plan.

Continue implementing.

---

## Phase 2 — Scaffold

Create:

- `package.json`;
- source folders;
- tests;
- lint;
- prettier;
- gitignore;
- env example;
- initial exports.

---

## Phase 3 — Core

Implement:

- `Whapi`;
- HTTP client;
- authentication;
- errors;
- timeout;
- query params;
- retry strategy;
- AbortSignal;
- validation;
- logging.

Write tests immediately.

---

## Phase 4 — Resources

Implement in priority order:

1. health;
2. messages;
3. channels/newsletters;
4. media helpers;
5. settings/webhook helpers.

Test every resource.

---

## Phase 5 — High-level helpers

Implement:

```js
whapi.channels.publish(...)
whapi.news.publishArticle(...)
```

Implement:

- article formatter;
- UTM helper;
- image/text fallback.

Test them.

---

## Phase 6 — Examples

Create and verify examples.

Examples must compile/run without syntax errors.

Do not execute examples that send real messages unless explicitly configured.

---

## Phase 7 — Documentation

Only after the API is stable, generate:

```text
README.md
README.uk.md
docs/API.en.md
docs/API.uk.md
```

Documentation must match the actual implementation.

Do not document methods that do not exist.

Do not omit public methods.

---

## Phase 8 — Final QA

Run:

```bash
npm ci
npm run lint
npm run format:check
npm test
```

Fix all failures.

Search the repository for accidentally committed tokens/secrets.

Check:

```text
WHAPI_TOKEN
Bearer
authorization
gate.whapi.cloud
```

Ensure examples contain only environment-variable placeholders.

---

# 52. Acceptance criteria

The task is complete only if all of the following are true.

## Installation/API

- SDK can be imported in Node.js.
- `new Whapi({ token })` works.
- token is automatically sent as Bearer auth.
- health check works.
- text messages can be sent.
- WhatsApp Channel ID is handled correctly.
- text can be published to a Channel.
- image can be published to a Channel if supported by current Whapi API.
- video can be published if supported.
- link preview can be published if supported.
- interactive channel types requested above are implemented where currently supported.
- channel posts/history can be retrieved.
- pagination is implemented correctly.
- `channels.publish()` works.
- `news.publishArticle()` works.
- UTM parameters are added correctly.
- raw API access exists.

## Reliability

- timeout works.
- errors are normalized.
- 429 is distinguishable.
- retry policy is safe.
- unsafe message retries are not enabled by default.
- secrets are redacted.

## Quality

- no TypeScript source.
- JSDoc autocomplete exists.
- lint passes.
- tests pass.
- formatting check passes.
- Node.js 20 CI passes.
- Node.js 22 CI passes.
- no real API token exists in repository.

## Documentation

- complete English README exists.
- complete Ukrainian README exists.
- English API reference exists.
- Ukrainian API reference exists.
- both languages cover the same public functionality.
- examples are included.
- retry/duplicate risk is documented.
- Whapi compatibility/version is documented.
- unofficial SDK disclaimer is present.

---

# 53. Expected developer experience

The finished SDK should make common operations very small.

## Initialization

```js
import { Whapi } from '@your-scope/whapi-sdk';

const whapi = new Whapi({
  token: process.env.WHAPI_TOKEN,
});
```

## Publish text to Channel

```js
await whapi.channels.publishText(process.env.WHAPI_CHANNEL_ID, 'New article');
```

## Publish image

```js
await whapi.channels.publishImage(process.env.WHAPI_CHANNEL_ID, {
  source: 'https://example.com/image.jpg',
  caption: 'New article',
});
```

The exact media call shape can be changed if current Whapi schemas make another shape better.

## Publish article

```js
await whapi.news.publishArticle({
  channelId: process.env.WHAPI_CHANNEL_ID,
  title: post.title,
  description: post.excerpt,
  image: post.image,
  url: post.url,
  utm: {
    source: 'whatsapp',
    medium: 'channel',
    campaign: 'news',
  },
});
```

## Read Channel posts

```js
const posts = await whapi.channels.getPosts(process.env.WHAPI_CHANNEL_ID, {
  count: 50,
});
```

## Handle errors

```js
import { WhapiRateLimitError, WhapiValidationError } from '@your-scope/whapi-sdk';

try {
  await whapi.channels.publishText(channelId, text);
} catch (error) {
  if (error instanceof WhapiRateLimitError) {
    // retry later
  }

  if (error instanceof WhapiValidationError) {
    // fix local input
  }

  throw error;
}
```

---

# 54. Important architectural rules

Follow these rules throughout the project:

1. Resource modules must not create their own independent HTTP clients.
2. All requests go through one shared HTTP layer.
3. Channel publishing must reuse message sending methods.
4. News publishing must reuse channel publishing.
5. Errors must be consistent across all resources.
6. Do not swallow server errors.
7. Preserve raw Whapi response data.
8. Do not expose credentials.
9. Do not automatically retry potentially duplicated message sends.
10. Do not over-abstract simple REST functionality.
11. Prefer readable code over clever code.
12. Keep the public API predictable.
13. Avoid breaking names after documentation is written.
14. Add tests for every bug discovered during implementation.

---

# 55. Final report from the AI agent

When implementation is complete, the agent must provide a final summary.

The summary must contain:

```text
1. What was implemented
2. Project structure
3. Main public SDK methods
4. Whapi/OpenAPI version used
5. Tests created
6. Test/lint results
7. Documentation files created
8. Known limitations
9. Features intentionally postponed to v2
10. How to run the SDK locally
```

Also explicitly report:

```text
npm test: PASS/FAIL
npm run lint: PASS/FAIL
npm run format:check: PASS/FAIL
```

If something is not implemented, state it clearly.

Do not claim completion if tests are failing.

---

# 56. Definition of done

The repository should be in a state where another Node.js developer can:

```bash
git clone ...
npm install
```

read the README, set:

```env
WHAPI_TOKEN=
WHAPI_CHANNEL_ID=
```

and understand how to:

- check Whapi connection;
- send a message;
- publish to a WhatsApp Channel;
- publish a news article;
- retrieve Channel posts;
- handle errors;
- safely integrate the SDK into a production Node.js service.

The developer should not need to read SDK source code to perform these common operations.

---

# 57. Reference links

Whapi.Cloud documentation:

```text
https://whapi.cloud/docs
https://whapi.cloud/changelog
https://whapi.cloud/how-to-automate-whatsapp-channels-api
https://panel.whapi.cloud/yaml/openapi.yaml
```

The agent must re-check these references at implementation time because Whapi.Cloud evolves frequently.

---

# 58. Final project naming recommendation

Use:

```text
Repository:
whapi-node-sdk

Package, if published under a personal/company scope:
@your-scope/whapi-sdk
```

Examples:

```text
@company/whapi-sdk
@sergii/whapi-sdk
```

Use the real npm organization/user scope.

Avoid naming that implies the package is the official Whapi.Cloud SDK unless you are actually publishing it on behalf of Whapi.Cloud.
