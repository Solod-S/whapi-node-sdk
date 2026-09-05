# Whapi Node SDK — Довідник API (Українська)

[English](./API.en.md) | Українська

Цей документ містить повний технічний опис кожного публічного класу, методу та допоміжної утиліти в `@your-scope/whapi-sdk`.

---

## Зміст

- [Ініціалізація клієнта](#ініціалізація-клієнта)
  - [`new Whapi(options)`](#new-whapioptions)
  - [`whapi.raw.request(params)`](#whapirawrequestparams)
- [Стан інстансу (Health)](#стан-інстансу-health)
  - [`whapi.health.check(params?, options?)`](#whapihealthcheckparams-options)
- [Налаштування (Settings)](#налаштування-settings)
  - [`whapi.settings.get(options?)`](#whapisettingsgetoptions)
  - [`whapi.settings.update(settings, options?)`](#whapisettingsupdatesettings-options)
  - [`whapi.settings.reset(options?)`](#whapisettingsresetoptions)
  - [`whapi.settings.getEvents(options?)`](#whapisettingsgeteventsoptions)
  - [`whapi.settings.testWebhook(payload, options?)`](#whapisettingstestwebhookpayload-options)
- [Повідомлення (Messages)](#повідомлення-messages)
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
- [Канали WhatsApp (Channels / Newsletters)](#канали-whatsapp-channels--newsletters)
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
- [Медіа (Media)](#медіа-media)
  - [`whapi.media.upload(fileOrBuffer, options?)`](#whapimediauploadfileorbuffer-options)
  - [`whapi.media.get(mediaId, options?)`](#whapimediagetmediaid-options)
  - [`whapi.media.list(query?, options?)`](#whapimedialistquery-options)
- [Вебхуки (Webhooks)](#вебхуки-webhooks)
  - [`whapi.webhooks.getEvents(options?)`](#whapiwebhooksgeteventsoptions)
  - [`whapi.webhooks.test(payload, options?)`](#whapiwebhookstestpayload-options)
  - [`whapi.webhooks.parse(payload)`](#whapiwebhooksparsepayload)
- [Публікатор новин (NewsPublisher)](#публікатор-новин-newspublisher)
  - [`whapi.news.publishArticle(params)`](#whapinewspublisharticleparams)
- [Утиліти (Utilities)](#утиліти-utilities)
  - [`normalizeChannelId(id)`](#normalizechannelidid)
  - [`normalizeRecipient(to)`](#normalizerecipientto)
  - [`addUtm(url, utm)`](#addutmurl-utm)
  - [`truncateText(text, maxLength, options?)`](#truncatetexttext-maxlength-options)
  - [`formatArticlePost(params)`](#formatarticlepostparams)

---

## Ініціалізація клієнта

### `new Whapi(options)`

Створює новий екземпляр клієнта Whapi SDK.

#### Параметри

- `options` (`object`, обов'язковий):
  - `token` (`string`, обов'язковий): Ваш API-токен Whapi.Cloud. Не може бути порожнім.
  - `baseUrl` (`string`, необов'язковий, за замовчуванням: `'https://gate.whapi.cloud'`): Базовий URL шлюзу.
  - `timeout` (`number`, необов'язковий, за замовчуванням: `30000`): Таймаут запитів у мілісекундах.
  - `retry` (`object`, необов'язковий):
    - `enabled` (`boolean`, необов'язковий, за замовчуванням: `true`): Увімкнення повторних спроб.
    - `attempts` (`number`, необов'язковий, за замовчуванням: `3`): Максимальна кількість спроб.
    - `minDelay` (`number`, необов'язковий, за замовчуванням: `500`): Мінімальна затримка в мілісекундах.
    - `maxDelay` (`number`, необов'язковий, за замовчуванням: `5000`): Максимальна затримка в мілісекундах.
    - `retryUnsafeRequests` (`boolean`, необов'язковий, за замовчуванням: `false`): Дозвіл повторювати неідемпотентні запити (POST, PATCH, DELETE). За замовчуванням вимкнено для запобігання дублюванню повідомлень.
  - `logger` (`object`, необов'язковий): Користувацький об'єкт логера (наприклад, `console`) з методами `debug`, `info`, `warn`, `error`.

#### Повертає

`Whapi`: Налаштований екземпляр клієнта.

#### Генерує винятки

`WhapiValidationError`: Якщо токен відсутній, порожній або не є рядком.

#### Приклад

```js
import { Whapi } from '@your-scope/whapi-sdk';

const whapi = new Whapi({
  token: process.env.WHAPI_TOKEN,
  timeout: 15_000,
});
```

---

### `whapi.raw.request(params)`

Прямий виклик будь-якого ендпоінта Whapi з використанням єдиної авторизації, таймаутів та обробки помилок.

#### Параметри

- `params` (`object`, обов'язковий):
  - `method` (`string`, необов'язковий, за замовчуванням: `'GET'`): HTTP-метод.
  - `path` (`string`, обов'язковий): Шлях ендпоінта (наприклад, `'/calls/outgoing'`).
  - `query` (`Record<string, unknown>`, необов'язковий): Query-параметри.
  - `body` (`unknown`, необов'язковий): Тіло запиту.
  - `headers` (`Record<string, string>`, необов'язковий): Додаткові заголовки.
  - `signal` (`AbortSignal`, необов'язковий): Сигнал скасування.

#### Повертає

`Promise<any>`: Відповідь API.

---

## Стан інстансу (Health)

### `whapi.health.check(params?, options?)`

Перевіряє робочий статус підключеного інстансу WhatsApp.

#### Параметри

- `params` (`object`, необов'язковий):
  - `wakeup` (`boolean`, необов'язковий): Спроба пробудити інстанс.
  - `platform` (`string`, необов'язковий): Фільтр за платформою.
  - `channel_type` (`string`, необов'язковий): Тип каналу.
- `options` (`object`, необов'язковий): `signal`.

#### Повертає

`Promise<object>`: Об'єкт стану інстансу Whapi (`status.code`, `status.text`).

---

## Налаштування (Settings)

### `whapi.settings.get(options?)`

Отримує поточні налаштування сесії.

---

### `whapi.settings.update(settings, options?)`

Оновлює вказані поля конфігурації сесії каналу.

---

### `whapi.settings.reset(options?)`

Скидає налаштування до значень за замовчуванням.

---

### `whapi.settings.getEvents(options?)`

Повертає список підтримуваних типів подій для вебхуків.

---

### `whapi.settings.testWebhook(payload, options?)`

Надсилає тестову подію вебхука на вказаний URL.

---

## Повідомлення (Messages)

### `whapi.messages.sendText(to, text, options?)`

Надсилає текстове повідомлення на номер контакту або в чат/канал.

#### Параметри

- `to` (`string`, обов'язковий): Одержувач.
- `text` (`string`, обов'язковий): Текст повідомлення.
- `options` (`object`, необов'язковий): `typing_time`, `quoted`, `view_once`, `signal`.

---

### `whapi.messages.sendImage(to, image, options?)`

Надсилає зображення з можливістю додавання підпису.

#### Параметри

- `to` (`string`, обов'язковий): Одержувач.
- `image` (`string|object|Buffer|Uint8Array`, обов'язковий): URL, Base64 Data URI, Buffer або `{ source, caption }`.
- `options` (`object`, необов'язковий): `caption`, `view_once`, `signal`.

---

### `whapi.messages.sendVideo(to, video, options?)`

Надсилає відеоповідомлення.

---

### `whapi.messages.sendShortVideo(to, video, options?)`

Надсилає кругле коротке відеоповідомлення (відеонотатку).

---

### `whapi.messages.sendGif(to, gif, options?)`

Надсилає анімацію GIF.

---

### `whapi.messages.sendAudio(to, audio, options?)`

Надсилає аудіофайл.

---

### `whapi.messages.sendVoice(to, audio, options?)`

Надсилає голосове повідомлення (PTT).

---

### `whapi.messages.sendDocument(to, document, options?)`

Надсилає документ/файл. Підтримує `filename` у options.

---

### `whapi.messages.sendLinkPreview(to, url, options?)`

Надсилає повідомлення з інформативною карткою попереднього перегляду посилання.

#### Параметри

- `to` (`string`, обов'язковий): Одержувач.
- `url` (`string`, обов'язковий): Посилання.
- `options` (`object`, необов'язковий): `title`, `description`, `preview` (Base64 JPEG).

---

### `whapi.messages.sendLocation(to, location, options?)`

Надсилає геолокацію (`{ latitude, longitude, name?, address? }`).

---

### `whapi.messages.sendLiveLocation(to, location, options?)`

Надсилає трансляцію живої локації.

---

### `whapi.messages.sendContact(to, contact, options?)`

Надсилає картку контакту (vCard).

---

### `whapi.messages.sendPoll(to, poll, options?)`

Надсилає інтерактивне опитування.

#### Параметри

- `to` (`string`, обов'язковий): Одержувач.
- `poll` (`object`, обов'язковий):
  - `title` або `question` (`string`, обов'язковий): Тема опитування.
  - `options` (`string[]`, обов'язковий): Варіанти відповідей (мінімум 2).
  - `multiple_answers` (`boolean`, необов'язковий): Дозвіл кількох відповідей.

---

### `whapi.messages.sendQuestion(to, question, options?)`

Надсилає картку запитання в канал WhatsApp.

---

### `whapi.messages.sendQuiz(to, quiz, options?)`

Надсилає вікторину (квіз) з валідованою правильною відповіддю в канал WhatsApp.

#### Параметри

- `to` (`string`, обов'язковий): Канал одержувача.
- `quiz` (`object`, обов'язковий):
  - `title` або `question` (`string`, обов'язковий): Запитання вікторини.
  - `options` (`string[]`, обов'язковий): Варіанти відповідей (мінімум 2).
  - `correct_option_index` (`number`, обов'язковий): Індекс правильного варіанта (від 0).

---

### `whapi.messages.send(payload, options?)`

Універсальний диспетчер надсилання повідомлень. Автоматично аналізує `payload.type` та викликає відповідний метод.

---

### `whapi.messages.list(query?, options?)`

Отримує список повідомлень з усіх чатів.

---

### `whapi.messages.listByChat(chatId, query?, options?)`

Отримує повідомлення для конкретного чату.

---

### `whapi.messages.get(messageId, options?)`

Отримує одне повідомлення за його ID.

---

### `whapi.messages.delete(messageId, options?)`

Видаляє повідомлення за ID.

---

## Канали WhatsApp (Channels / Newsletters)

### `whapi.channels.list(query?, options?)`

Отримує список каналів, створених або відстежуваних акаунтом.

---

### `whapi.channels.get(channelId, options?)`

Отримує інформацію про канал. Автоматично нормалізує `channelId`.

---

### `whapi.channels.create(data, options?)`

Створює новий канал WhatsApp (`data.name` обов'язковий).

---

### `whapi.channels.update(channelId, data, options?)`

Оновлює метадані каналу (`name`, `description`, `picture`).

---

### `whapi.channels.delete(channelId, options?)`

Видаляє канал WhatsApp.

---

### `whapi.channels.subscribe(channelId, options?)`

Підписується на канал.

---

### `whapi.channels.unsubscribe(channelId, options?)`

Відписується від каналу.

---

### `whapi.channels.subscribeByInvite(inviteCode, options?)`

Підписується на канал за кодом запрошення.

---

### `whapi.channels.unsubscribeByInvite(inviteCode, options?)`

Відписується від каналу за кодом запрошення.

---

### `whapi.channels.find(params?, options?)`

Пошук публічних каналів за фільтрами (`search`, `country_code`).

---

### `whapi.channels.getRecommended(params?, options?)`

Отримує рекомендовані канали для країни.

---

### `whapi.channels.getInviteLink(inviteCode, options?)`

Отримує інформацію про канал за посиланням або кодом запрошення.

---

### `whapi.channels.track(channelId, options?)`

Підписується на оновлення подій каналу (голосування тощо).

---

### `whapi.channels.markPaidPartnership(channelId, messageId, options?)`

Позначає пост як оплачену рекламу (Paid Partnership).

---

### `whapi.channels.getPosts(channelId, query?, options?)`

Отримує історію публікацій каналу з підтримкою параметрів пагінації (`count`, `before`, `after`).

---

### `whapi.channels.iteratePosts(channelId, options?)`

Асинхронний генератор для послідовного читання публікацій без перевантаження пам'яті.

#### Параметри

- `channelId` (`string`, обов'язковий)
- `options` (`object`, необов'язковий): `pageSize` (за замовчуванням 50), `limit` (кількість постів), `signal`.

#### Приклад

```js
for await (const post of whapi.channels.iteratePosts(channelId, { limit: 100 })) {
  console.log(post.id);
}
```

---

### Хелпери публікації в канал

Наведені методи нормалізують `channelId` та передають виклик напряму в `whapi.messages.*`:

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

## Медіа (Media)

### `whapi.media.upload(fileOrBuffer, options?)`

Завантажує файл у хмарне сховище Whapi. Повертає `{ id: string }`.

---

### `whapi.media.get(mediaId, options?)`

Отримує метадані завантаженого файлу за його ID.

---

### `whapi.media.list(query?, options?)`

Отримує список збережених медіа-файлів у сховищі.

---

## Вебхуки (Webhooks)

### `whapi.webhooks.getEvents(options?)`

Отримує перелік доступних подій.

---

### `whapi.webhooks.test(payload, options?)`

Відправляє тестову подію на URL вебхука.

---

### `whapi.webhooks.parse(payload)`

Парсить вхідний JSON вебхука та повертає структурований об'єкт події з масивами `messages`, `contacts`, `statuses` та прапорцями `hasMessages`, `hasContacts`.

---

## Публікатор новин (NewsPublisher)

### `whapi.news.publishArticle(params)`

Високорівневий метод для публікації статей із WordPress та інших CMS.

#### Параметри

- `params` (`object`, обов'язковий):
  - `channelId` (`string`, обов'язковий): ID каналу WhatsApp.
  - `title` (`string`, обов'язковий): Заголовок статті.
  - `description` (`string`, необов'язковий): Короткий опис чи анонс.
  - `image` (`string|Buffer|object`, необов'язковий): Зображення. Якщо відсутнє, пост публікується у текстовому форматі.
  - `url` (`string`, необов'язковий): Посилання на матеріал.
  - `utm` (`object`, необов'язковий): Параметри UTM (`source`, `medium`, `campaign`, `term`, `content`).
  - `formatting` (`object`, необов'язковий): Налаштування форматування (`includeTitle`, `includeDescription`, `includeUrl`, `maxDescriptionLength`).
  - `signal` (`AbortSignal`, необов'язковий): Сигнал скасування.

#### Повертає

`Promise<{ success: boolean, channelId: string, type: 'image'|'text', messageId?: string, url?: string, response: object }>`

---

## Утиліти (Utilities)

### `normalizeChannelId(id)`

Нормалізує числовий ID у формат `@newsletter`. Генерує `WhapiValidationError` у разі некоректного формату.

---

### `normalizeRecipient(to)`

Валідує та нормалізує номери телефонів та WhatsApp JID.

---

### `addUtm(url, utm)`

Додає UTM-параметри до URL через нативний парсер `URL`, зберігаючи всі вже наявні query-параметри.

---

### `truncateText(text, maxLength, options?)`

Безпечно обрізає текст по межах слів, не пошкоджуючи сурогатні пари Unicode чи емодзі.

---

### `formatArticlePost(params)`

Формує акуратний текст поста (TITLE + DESCRIPTION + URL).
