/**
 * Example: Publishing an image post with a caption to a WhatsApp Channel.
 *
 * Run:
 *   node --env-file=.env examples/channel-image.js
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
  console.log(`Publishing image to channel ${channelId}...`);

  const response = await whapi.channels.publishImage(channelId, {
    source: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/JPEG_example_flower.jpg',
    caption: 'Beautiful flower published via Whapi Node SDK 🌸',
  });

  console.log('Image post published successfully:', response);
} catch (error) {
  console.error('Failed to publish image post:', error);
}
