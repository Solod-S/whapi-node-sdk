/**
 * JSDoc Type Definitions for Whapi Node SDK.
 * @module types
 */

/**
 * @typedef {object} RetryOptions
 * @property {boolean} [enabled=true] - Whether retries are enabled
 * @property {number} [attempts=3] - Maximum retry attempts
 * @property {number} [minDelay=500] - Minimum delay in milliseconds
 * @property {number} [maxDelay=5000] - Maximum delay in milliseconds
 * @property {boolean} [retryUnsafeRequests=false] - Whether to retry non-idempotent POST/PATCH/DELETE requests
 */

/**
 * @typedef {object} WhapiOptions
 * @property {string} token - Whapi.Cloud API token (required)
 * @property {string} [baseUrl='https://gate.whapi.cloud'] - Base gateway URL
 * @property {number} [timeout=30000] - Request timeout in milliseconds
 * @property {RetryOptions} [retry] - Retry policy configuration
 * @property {object} [logger] - Custom logger object (e.g. console)
 */

/**
 * @typedef {object} UtmParameters
 * @property {string} [source] - utm_source
 * @property {string} [medium] - utm_medium
 * @property {string} [campaign] - utm_campaign
 * @property {string} [term] - utm_term
 * @property {string} [content] - utm_content
 * @property {string} [key: string] - Any additional custom UTM parameter
 */

/**
 * @typedef {object} ArticleFormattingOptions
 * @property {boolean} [includeTitle=true] - Whether to include the title in the message body
 * @property {boolean} [includeDescription=true] - Whether to include the description/excerpt
 * @property {boolean} [includeUrl=true] - Whether to include the URL link
 * @property {number} [maxDescriptionLength] - Maximum length to truncate description at
 */

/**
 * @typedef {object} PublishArticleOptions
 * @property {string} channelId - WhatsApp Channel ID
 * @property {string} title - Article title
 * @property {string} [description] - Article excerpt or text
 * @property {string|object|Buffer|Uint8Array} [image] - Featured image URL, buffer, or descriptor
 * @property {string} [url] - Target article URL
 * @property {UtmParameters} [utm] - UTM parameters
 * @property {ArticleFormattingOptions} [formatting] - Post text formatting options
 * @property {AbortSignal} [signal] - AbortSignal to cancel request
 */

/**
 * @typedef {object} PublishArticleResult
 * @property {boolean} success - Whether the operation succeeded
 * @property {string} channelId - Normalized Channel ID
 * @property {'image'|'text'} type - Whether it was sent as image post or text post
 * @property {string} [messageId] - WhatsApp message ID if returned by Whapi
 * @property {string} [url] - Formatted URL with UTM tags
 * @property {object} response - Original raw Whapi response
 */

/**
 * @typedef {object} SendTextOptions
 * @property {number} [typing_time] - Simulation typing time in seconds (0-60)
 * @property {boolean} [no_link_preview] - Disable automatic link preview
 * @property {boolean} [wide_link_preview] - Attempt full-width link preview
 * @property {string} [quoted] - Message ID to quote/reply to
 * @property {string} [edit] - Message ID to edit
 * @property {boolean} [view_once] - Send as view-once message
 * @property {AbortSignal} [signal]
 */

/**
 * @typedef {object} SendImageOptions
 * @property {string} [caption] - Image caption text
 * @property {string} [quoted] - Message ID to quote
 * @property {boolean} [view_once] - View-once flag
 * @property {AbortSignal} [signal]
 */

/**
 * @typedef {object} PollPayload
 * @property {string} [title] - Poll title/question
 * @property {string} [question] - Alias for title
 * @property {string[]} options - Array of poll options (minimum 2)
 * @property {boolean} [multiple_answers=false] - Allow multiple selections
 */

/**
 * @typedef {object} QuizPayload
 * @property {string} [title] - Quiz title/question
 * @property {string} [question] - Alias for title
 * @property {string[]} options - Array of quiz options (minimum 2)
 * @property {number} correct_option_index - Zero-based index of correct option
 * @property {number} [correctOptionIndex] - CamelCase alias for correct_option_index
 */

export {};
