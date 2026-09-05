/**
 * Example: Retrieving and iterating through channel post history.
 *
 * Run:
 *   node --env-file=.env examples/list-channel-posts.js
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
  console.log(`Fetching latest posts for channel ${channelId}...`);

  // Fetch first batch of posts
  const result = await whapi.channels.getPosts(channelId, { count: 10 });
  const posts = result.messages || [];
  console.log(`Retrieved ${posts.length} post(s).`);

  // Example: Async iterator with limit
  console.log('Iterating through posts with async generator...');
  let count = 0;
  for await (const post of whapi.channels.iteratePosts(channelId, { pageSize: 20, limit: 50 })) {
    count += 1;
    console.log(`[${count}] ID: ${post.id}, Type: ${post.type || 'unknown'}`);
  }
} catch (error) {
  console.error('Failed to retrieve channel posts:', error);
}
