# Whapi Node SDK — API Reference (English)

[English](./API.en.md) | [Українська](./API.uk.md)

This document provides complete technical reference documentation for every public class, method, and helper available in `@your-scope/whapi-sdk`.

---

## Table of Contents

- [Client Initialization](#client-initialization)
  - [`new Whapi(options)`](#new-whapioptions)
  - [`whapi.raw.request(params)`](#whapirawrequestparams)
- [Health](#health)
  - [`whapi.health.check(params?, options?)`](#whapihealthcheckparams-options)
- [Settings](#settings)
  - [`whapi.settings.get(options?)`](#whapisettingsgetoptions)
  - [`whapi.settings.update(settings, options?)`](#whapisettingsupdatesettings-options)
  - [`whapi.settings.reset(options?)`](#whapisettingsresetoptions)
  - [`whapi.settings.getEvents(options?)`](#whapisettingsgeteventsoptions)
  - [`whapi.settings.testWebhook(payload, options?)`](#whapisettingstestwebhookpayload-options)
- [Messages](#messages)
  - [`whapi.messages.sendText(to, text, options?)`](#whapimessagessendtextto-text-options)
  - [`whapi.messages.sendImage(to, image, options?)`](#whapimessagessendimageto-image-options)
  - [`whapi.messages.sendVideo(to, video, options?)`](#whapimessagessendvideoto-video-options)
  - [`whapi.messages.sendShortVideo(to, video, options?)`](#whapimessagessendshortvideoto-video-options)
  - [`whapi.messages.sendGif(to, gif, options?)`](#whapimessagessendgifto-gif-options)
  - [`whapi.messages.sendAudio(to, audio, options?)`](#whapimessagessendaudioto-audio-options)
  - [`whapi.messages.sendVoice(to, audio, options?)`](#whapimessagessendvoiceto-audio-options)
  - [`whapi.messages.sendDocument(to, document, options?)`](#whapimessagessenddocumentto-document-options)
  - [`whapi.messages.sendLinkPreview(to, url, options?)`](#whapimessagessendlinkpreviewto-url-options)
  - [`whapi.messages.sendLocation(to, location, options?)`](#whapimessagessendlocationto-location-options)
  - [`whapi.messages.sendLiveLocation(to, location, options?)`](#whapimessagessendlivelocationto-location-options)
  - [`whapi.messages.sendContact(to, contact, options?)`](#whapimessagessendcontactto-contact-options)
  - [`whapi.messages.sendPoll(to, poll, options?)`](#whapimessagessendpollto-poll-options)
  - [`whapi.messages.sendQuestion(to, question, options?)`](#whapimessagessendquestionto-question-options)
  - [`whapi.messages.sendQuiz(to, quiz, options?)`](#whapimessagessendquizto-quiz-options)
  - [`whapi.messages.send(payload, options?)`](#whapimessagessendpayload-options)
  - [`whapi.messages.list(query?, options?)`](#whapimessageslistquery-options)
  - [`whapi.messages.listByChat(chatId, query?, options?)`](#whapimessageslistbychatchatid-query-options)
  - [`whapi.messages.get(messageId, options?)`](#whapimessagesgetmessageid-options)
  - [`whapi.messages.delete(messageId, options?)`](#whapimessagesdeletemessageid-options)
- [Channels (Newsletters)](#channels-newsletters)
  - [`whapi.channels.list(query?, options?)`](#whapichannelslistquery-options)
  - [`whapi.channels.get(channelId, options?)`](#whapichannelsgetchannelid-options)
  - [`whapi.channels.create(data, options?)`](#whapichannelscreatedata-options)
  - [`whapi.channels.update(channelId, data, options?)`](#whapichannelsupdatechannelid-data-options)
  - [`whapi.channels.delete(channelId, options?)`](#whapichannelsdeletechannelid-options)
  - [`whapi.channels.subscribe(channelId, options?)`](#whapichannelssubscribechannelid-options)
  - [`whapi.channels.unsubscribe(channelId, options?)`](#whapichannelsunsubscribechannelid-options)
  - [`whapi.channels.subscribeByInvite(inviteCode, options?)`](#whapichannelssubscribebyinviteinvitecode-options)
  - [`whapi.channels.unsubscribeByInvite(inviteCode, options?)`](#whapichannelsunsubscribebyinviteinvitecode-options)
  - [`whapi.channels.find(params?, options?)`](#whapichannelsfindparams-options)
  - [`whapi.channels.getRecommended(params?, options?)`](#whapichannelsgetrecommendedparams-options)
  - [`whapi.channels.getInviteLink(inviteCode, options?)`](#whapichannelsgetinvitelinkinvitecode-options)
  - [`whapi.channels.track(channelId, options?)`](#whapichannelstrackchannelid-options)
  - [`whapi.channels.markPaidPartnership(channelId, messageId, options?)`](#whapichannelsmarkpaidpartnershipchannelid-messageid-options)
  - [`whapi.channels.getPosts(channelId, query?, options?)`](#whapichannelsgetpostschannelid-query-options)
  - [`whapi.channels.iteratePosts(channelId, options?)`](#whapichannelsiteratepostschannelid-options)
  - [`whapi.channels.publishText(channelId, text, options?)`](#whapichannelspublishtextchannelid-text-options)
  - [`whapi.channels.publishImage(channelId, image, options?)`](#whapichannelspublishimagechannelid-image-options)
  - [`whapi.channels.publishVideo(channelId, video, options?)`](#whapichannelspublishvideochannelid-video-options)
  - [`whapi.channels.publishLink(channelId, url, options?)`](#whapichannelspublishlinkchannelid-url-options)
  - [`whapi.channels.publishVoice(channelId, audio, options?)`](#whapichannelspublishvoicechannelid-audio-options)
  - [`whapi.channels.publishPoll(channelId, poll, options?)`](#whapichannelspublishpollchannelid-poll-options)
  - [`whapi.channels.publishQuestion(channelId, question, options?)`](#whapichannelspublishquestionchannelid-question-options)
  - [`whapi.channels.publishQuiz(channelId, quiz, options?)`](#whapichannelspublishquizchannelid-quiz-options)
  - [`whapi.channels.publish(channelId, payload, options?)`](#whapichannelspublishchannelid-payload-options)
- [Media](#media)
  - [`whapi.media.upload(fileOrBuffer, options?)`](#whapimediauploadfileorbuffer-options)
  - [`whapi.media.get(mediaId, options?)`](#whapimediagetmediaid-options)
  - [`whapi.media.list(query?, options?)`](#whapimedialistquery-options)
- [Webhooks](#webhooks)
  - [`whapi.webhooks.getEvents(options?)`](#whapiwebhooksgeteventsoptions)
  - [`whapi.webhooks.test(payload, options?)`](#whapiwebhookstestpayload-options)
  - [`whapi.webhooks.parse(payload)`](#whapiwebhooksparsepayload)
- [News Publisher Helper](#news-publisher-helper)
  - [`whapi.news.publishArticle(params)`](#whapinewspublisharticleparams)
- [Utilities](#utilities)
  - [`normalizeChannelId(id)`](#normalizechannelidid)
  - [`normalizeRecipient(to)`](#normalizerecipientto)
  - [`addUtm(url, utm)`](#addutmurl-utm)
  - [`truncateText(text, maxLength, options?)`](#truncatetexttext-maxlength-options)
  - [`formatArticlePost(params)`](#formatarticlepostparams)

---

## Client Initialization

### `new Whapi(options)`

Creates a new instance of the Whapi SDK client.

#### Parameters

- `options` (`object`, required):
  - `token` (`string`, required): Your Whapi.Cloud API token. Must be non-empty.
  - `baseUrl` (`string`, optional, default: `'https://gate.whapi.cloud'`): Whapi gateway base URL.
  - `timeout` (`number`, optional, default: `30000`): HTTP request timeout in milliseconds.
  - `retry` (`object`, optional):
    - `enabled` (`boolean`, optional, default: `true`): Whether automatic retries are enabled.
    - `attempts` (`number`, optional, default: `3`): Maximum attempts for retryable requests.
    - `minDelay` (`number`, optional, default: `500`): Minimum delay in milliseconds between retries.
    - `maxDelay` (`number`, optional, default: `5000`): Maximum delay in milliseconds between retries.
    - `retryUnsafeRequests` (`boolean`, optional, default: `false`): When `false`, POST, PATCH, and DELETE requests are never retried after ambiguous network timeouts to prevent duplicate messages.
  - `logger` (`object`, optional): Custom logger implementation (e.g. `console`) providing `debug`, `info`, `warn`, and `error` methods.

#### Returns

`Whapi`: Configured client instance.

#### Throws

`WhapiValidationError`: If `token` is missing, empty, or not a string.

#### Example

```js
import { Whapi } from '@your-scope/whapi-sdk';

const whapi = new Whapi({
  token: process.env.WHAPI_TOKEN,
  timeout: 15_000,
});
```

---

### `whapi.raw.request(params)`

Low-level escape hatch for issuing authenticated requests directly to any Whapi endpoint.

#### Parameters

- `params` (`object`, required):
  - `method` (`string`, optional, default: `'GET'`): HTTP method.
  - `path` (`string`, required): Endpoint path (e.g., `'/calls/outgoing'`).
  - `query` (`Record<string, unknown>`, optional): URL query parameters.
  - `body` (`unknown`, optional): Request payload (JSON object, FormData, Buffer, or string).
  - `headers` (`Record<string, string>`, optional): Additional request headers.
  - `signal` (`AbortSignal`, optional): Cancellation signal.

#### Returns

`Promise<any>`: Parsed API response.

#### Throws

`WhapiApiError`, `WhapiTimeoutError`, `WhapiNetworkError`.

---

## Health

### `whapi.health.check(params?, options?)`

Checks the operational status and connectivity of the connected WhatsApp channel/session.

#### Parameters

- `params` (`object`, optional):
  - `wakeup` (`boolean`, optional): Attempt to wake up the channel instance.
  - `platform` (`string`, optional): Platform filter.
  - `channel_type` (`string`, optional): Channel type filter.
- `options` (`object`, optional):
  - `signal` (`AbortSignal`, optional): Cancellation signal.

#### Returns

`Promise<object>`: Whapi health status payload (containing `status.code`, `status.text`).

#### Example

```js
const health = await whapi.health.check();
console.log('Status:', health.status.text);
```

---

## Settings

### `whapi.settings.get(options?)`

Retrieves current settings of the WhatsApp channel session.

#### Returns

`Promise<object>`: Settings payload.

---

### `whapi.settings.update(settings, options?)`

Updates channel settings. Only provided fields are modified.

#### Parameters

- `settings` (`object`, required): Documented Whapi settings to update.
- `options` (`object`, optional): Includes `signal`.

#### Returns

`Promise<object>`: Updated settings response.

---

### `whapi.settings.reset(options?)`

Resets channel settings to system defaults.

#### Returns

`Promise<object>`: Confirmation payload.

---

### `whapi.settings.getEvents(options?)`

Retrieves the list of supported webhook event types.

#### Returns

`Promise<object>`: Object containing available event names.

---

### `whapi.settings.testWebhook(payload, options?)`

Triggers a test webhook delivery to a target URL.

#### Parameters

- `payload` (`object`, required):
  - `url` (`string`, required): Webhook destination URL.
  - `type` (`string`, required): Event type to simulate.
  - `mode` (`string`, optional, default: `'sync'`): Mode (`'sync'` or `'async'`).

#### Returns

`Promise<object>`: Test result status.

---

## Messages

### `whapi.messages.sendText(to, text, options?)`

Sends a plain text message to a contact, group, or channel.

#### Parameters

- `to` (`string`, required): Recipient identifier.
- `text` (`string`, required): Message content.
- `options` (`object`, optional):
  - `typing_time` (`number`, optional): Simulated typing duration in seconds (0-60).
  - `quoted` (`string`, optional): Message ID to quote/reply to.
  - `view_once` (`boolean`, optional): View-once flag.
  - `signal` (`AbortSignal`, optional): Cancellation signal.

#### Returns

`Promise<object>`: Whapi sent message response (`{ sent: true, message: { id } }`).

#### Throws

`WhapiValidationError`, `WhapiApiError`.

---

### `whapi.messages.sendImage(to, image, options?)`

Sends an image message with optional caption.

#### Parameters

- `to` (`string`, required): Recipient identifier.
- `image` (`string|object|Buffer|Uint8Array`, required): Image URL, base64 data URI, Buffer, or descriptor `{ source, caption }`.
- `options` (`object`, optional):
  - `caption` (`string`, optional): Caption text.
  - `view_once` (`boolean`, optional): View-once flag.
  - `signal` (`AbortSignal`, optional): Cancellation signal.

#### Returns

`Promise<object>`: Sent message response.

---

### `whapi.messages.sendVideo(to, video, options?)`

Sends a video message.

#### Parameters

- `to` (`string`, required): Recipient identifier.
- `video` (`string|object|Buffer|Uint8Array`, required): Video source.
- `options` (`object`, optional): `caption`, `signal`, etc.

---

### `whapi.messages.sendShortVideo(to, video, options?)`

Sends a circular video note message.

---

### `whapi.messages.sendGif(to, gif, options?)`

Sends an animated GIF message.

---

### `whapi.messages.sendAudio(to, audio, options?)`

Sends an audio file message.

---

### `whapi.messages.sendVoice(to, audio, options?)`

Sends a voice note (PTT recording).

---

### `whapi.messages.sendDocument(to, document, options?)`

Sends a file/document. Supports `filename` in options.

---

### `whapi.messages.sendLinkPreview(to, url, options?)`

Sends a message with a rich preview card for the specified link.

#### Parameters

- `to` (`string`, required): Recipient identifier.
- `url` (`string`, required): Target URL.
- `options` (`object`, optional):
  - `title` (`string`, optional): Link preview title.
  - `description` (`string`, optional): Link preview description.
  - `preview` (`string`, optional): Base64 JPEG preview thumbnail.

---

### `whapi.messages.sendLocation(to, location, options?)`

Sends a static location message.

#### Parameters

- `to` (`string`, required): Recipient identifier.
- `location` (`object`, required): `{ latitude: number, longitude: number, name?: string, address?: string }`.

---

### `whapi.messages.sendLiveLocation(to, location, options?)`

Sends a live location message.

---

### `whapi.messages.sendContact(to, contact, options?)`

Sends a contact card (vCard).

---

### `whapi.messages.sendPoll(to, poll, options?)`

Sends an interactive poll.

#### Parameters

- `to` (`string`, required): Recipient identifier.
- `poll` (`object`, required):
  - `title` or `question` (`string`, required): Poll question.
  - `options` (`string[]`, required): Array of at least 2 options.
  - `multiple_answers` (`boolean`, optional, default: `false`): Allow multi-choice.

---

### `whapi.messages.sendQuestion(to, question, options?)`

Sends an interactive question card to a WhatsApp Channel.

#### Parameters

- `to` (`string`, required): Channel recipient identifier.
- `question` (`string|object`, required): Question text or `{ body: string }`.

---

### `whapi.messages.sendQuiz(to, quiz, options?)`

Sends an interactive trivia quiz with a validated correct answer to a WhatsApp Channel.

#### Parameters

- `to` (`string`, required): Channel recipient identifier.
- `quiz` (`object`, required):
  - `title` or `question` (`string`, required): Quiz question.
  - `options` (`string[]`, required): Array of at least 2 options.
  - `correct_option_index` (`number`, required): Zero-based index of the correct answer.

---

### `whapi.messages.send(payload, options?)`

Universal message dispatcher. Automatically inspects `payload.type` and delegates to the appropriate specialized sending method.

#### Supported Types

`'text'`, `'image'`, `'video'`, `'short'`, `'gif'`, `'audio'`, `'voice'`, `'document'`, `'link'`, `'location'`, `'live_location'`, `'contact'`, `'poll'`, `'question'`, `'quiz'`.

---

### `whapi.messages.list(query?, options?)`

Lists messages across all chats.

---

### `whapi.messages.listByChat(chatId, query?, options?)`

Lists messages for a specific chat ID.

---

### `whapi.messages.get(messageId, options?)`

Retrieves a message by its ID.

---

### `whapi.messages.delete(messageId, options?)`

Deletes a message by its ID.

---

## Channels (Newsletters)

### `whapi.channels.list(query?, options?)`

Lists WhatsApp Channels owned or followed by the account.

---

### `whapi.channels.get(channelId, options?)`

Retrieves channel metadata. Automatically normalizes `channelId`.

---

### `whapi.channels.create(data, options?)`

Creates a new WhatsApp Channel. `data.name` is required.

---

### `whapi.channels.update(channelId, data, options?)`

Updates channel metadata (`name`, `description`, `picture`).

---

### `whapi.channels.delete(channelId, options?)`

Deletes a WhatsApp Channel.

---

### `whapi.channels.subscribe(channelId, options?)`

Follows/subscribes to a channel.

---

### `whapi.channels.unsubscribe(channelId, options?)`

Unfollows/unsubscribes from a channel.

---

### `whapi.channels.subscribeByInvite(inviteCode, options?)`

Subscribes to a channel using an invite code.

---

### `whapi.channels.unsubscribeByInvite(inviteCode, options?)`

Unsubscribes from a channel using an invite code.

---

### `whapi.channels.find(params?, options?)`

Searches public channels by filters (`search`, `country_code`, etc.).

---

### `whapi.channels.getRecommended(params?, options?)`

Retrieves recommended channels for a country.

---

### `whapi.channels.getInviteLink(inviteCode, options?)`

Retrieves channel metadata using an invite code.

---

### `whapi.channels.track(channelId, options?)`

Subscribes to channel update events (e.g. poll votes).

---

### `whapi.channels.markPaidPartnership(channelId, messageId, options?)`

Labels a channel post as a paid partnership.

---

### `whapi.channels.getPosts(channelId, query?, options?)`

Retrieves recent post history for a channel. Supports pagination (`count`, `before`, `after`).

---

### `whapi.channels.iteratePosts(channelId, options?)`

Async Generator that yields posts page-by-page.

#### Parameters

- `channelId` (`string`, required)
- `options` (`object`, optional):
  - `pageSize` (`number`, optional, default: `50`)
  - `limit` (`number`, optional, default: `Infinity`)
  - `signal` (`AbortSignal`, optional)

#### Example

```js
for await (const post of whapi.channels.iteratePosts(channelId, { limit: 100 })) {
  console.log(post.id);
}
```

---

### Channel Publishing Helpers

The following methods normalize `channelId` and delegate directly to `whapi.messages.*`:

- `whapi.channels.publishText(channelId, text, options?)`
- `whapi.channels.publishImage(channelId, image, options?)`
- `whapi.channels.publishVideo(channelId, video, options?)`
- `whapi.channels.publishLink(channelId, url, options?)`
- `whapi.channels.publishVoice(channelId, audio, options?)`
- `whapi.channels.publishPoll(channelId, poll, options?)`
- `whapi.channels.publishQuestion(channelId, question, options?)`
- `whapi.channels.publishQuiz(channelId, quiz, options?)`
- `whapi.channels.publish(channelId, payload, options?)`

---

## Media

### `whapi.media.upload(fileOrBuffer, options?)`

Uploads a binary media file (Buffer, Uint8Array, Blob, FormData) to Whapi cloud storage.

#### Returns

`Promise<{ id: string }>`: Object containing the generated `id`.

---

### `whapi.media.get(mediaId, options?)`

Retrieves media file metadata by ID.

---

### `whapi.media.list(query?, options?)`

Lists uploaded media files in storage.

---

## Webhooks

### `whapi.webhooks.getEvents(options?)`

Retrieves available webhook events.

---

### `whapi.webhooks.test(payload, options?)`

Sends a test webhook event.

---

### `whapi.webhooks.parse(payload)`

Parses incoming webhook JSON and returns an event object with `messages`, `contacts`, `statuses`, `hasMessages`, `hasContacts`.

---

## News Publisher Helper

### `whapi.news.publishArticle(params)`

High-level publishing method for WordPress and news CMS workflows.

#### Parameters

- `params` (`object`, required):
  - `channelId` (`string`, required): Channel ID.
  - `title` (`string`, required): Article title.
  - `description` (`string`, optional): Article excerpt or body.
  - `image` (`string|Buffer|object`, optional): Featured image. If omitted or empty, automatically falls back to text post.
  - `url` (`string`, optional): Article link.
  - `utm` (`object`, optional): UTM tracking parameters (`source`, `medium`, `campaign`, `term`, `content`).
  - `formatting` (`object`, optional): `{ includeTitle, includeDescription, includeUrl, maxDescriptionLength }`.
  - `signal` (`AbortSignal`, optional): Cancellation signal.

#### Returns

`Promise<{ success: boolean, channelId: string, type: 'image'|'text', messageId?: string, url?: string, response: object }>`

---

## Utilities

### `normalizeChannelId(id)`

Normalizes a numeric ID into `@newsletter` format. Throws `WhapiValidationError` if invalid.

---

### `normalizeRecipient(to)`

Validates and normalizes phone numbers and JIDs.

---

### `addUtm(url, utm)`

Appends UTM parameters using the standard `URL` parser, preserving existing query parameters.

---

### `truncateText(text, maxLength, options?)`

Safely truncates text at word boundaries without breaking Unicode surrogate pairs or emojis.

---

### `formatArticlePost(params)`

Formats title, description, and URL into a clean WhatsApp post layout.
