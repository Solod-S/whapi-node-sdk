/**
 * Example: Sending a direct/private message or media to a WhatsApp contact.
 *
 * Run:
 *   node --env-file=.env examples/send-private-message.js
 */
import { Whapi, WhapiRateLimitError } from '../src/index.js';

const token = process.env.WHAPI_TOKEN;
const recipientPhone = process.env.WHAPI_TEST_RECIPIENT || '12345678901';

if (!token) {
  console.error('Please set WHAPI_TOKEN in your environment.');
  process.exit(1);
}

const whapi = new Whapi({ token });

try {
  console.log(`Sending private message to ${recipientPhone}...`);

  // Direct text message
  const textResponse = await whapi.messages.sendText(
    recipientPhone,
    'Hello from Whapi Node SDK! How can we assist you today?',
  );
  console.log('Text message sent:', textResponse);

  // Link preview message
  const linkResponse = await whapi.messages.sendLinkPreview(recipientPhone, 'https://whapi.cloud', {
    title: 'Whapi.Cloud — Easy WhatsApp API Gateway',
  });
  console.log('Link message sent:', linkResponse);
} catch (error) {
  if (error instanceof WhapiRateLimitError) {
    console.error(`Rate limited! Retry after ${error.retryAfter}ms`);
  } else {
    console.error('Failed to send private message:', error);
  }
}
