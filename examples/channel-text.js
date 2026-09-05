/**
 * Example: Publishing a text message to a WhatsApp Channel.
 *
 * Run:
 *   node --env-file=.env examples/channel-text.js
 */
import { Whapi } from '../src/index.js';

const token = process.env.WHAPI_TOKEN;
const channelId = process.env.WHAPI_CHANNEL_ID;

if (!token || !channelId) {
  console.error('Please set WHAPI_TOKEN and WHAPI_CHANNEL_ID in your environment.');
  process.exit(1);
}

const whapi = new Whapi({ token });

try {
  console.log(`Publishing text to channel ${channelId}...`);

  const response = await whapi.channels.publishText(
    channelId,
    'Hello from Whapi Node.js SDK! This is a test post.',
  );

  console.log('Post published successfully:', response);
} catch (error) {
  console.error('Failed to publish text post:', error);
}
