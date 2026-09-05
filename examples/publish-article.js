/**
 * Example: Publishing a WordPress/news article to a WhatsApp Channel
 * with automatic UTM tagging, description truncation, and image/text fallback.
 *
 * Run:
 *   node --env-file=.env examples/publish-article.js
 */
import { Whapi } from '../src/index.js';

const token = process.env.WHAPI_TOKEN;
const channelId = process.env.WHAPI_CHANNEL_ID;

if (!token || !channelId) {
  console.error('Please set WHAPI_TOKEN and WHAPI_CHANNEL_ID in your environment.');
  process.exit(1);
}

const whapi = new Whapi({ token });

// Simulated WordPress post object
const wordPressPost = {
  title: 'Apple Introduces Groundbreaking M4 Pro and M4 Max Chips',
  excerpt:
    'Apple today announced M4 Pro and M4 Max, bringing phenomenal power-efficient performance and advanced capabilities to the Mac.',
  featuredImage: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/JPEG_example_flower.jpg',
  url: 'https://example.com/news/apple-m4-chips',
};

async function publishWordPressPostToWhatsApp(post) {
  console.log(`Publishing article "${post.title}" to WhatsApp Channel...`);

  const result = await whapi.news.publishArticle({
    channelId,
    title: post.title,
    description: post.excerpt,
    image: post.featuredImage, // if null/empty, automatically falls back to text-only post
    url: post.url,
    utm: {
      source: 'whatsapp',
      medium: 'channel',
      campaign: 'news_feed',
    },
    formatting: {
      maxDescriptionLength: 300,
    },
  });

  return result;
}

try {
  const result = await publishWordPressPostToWhatsApp(wordPressPost);
  console.log('Article successfully published:');
  console.log(`- Type: ${result.type}`);
  console.log(`- Message ID: ${result.messageId}`);
  console.log(`- Formatted URL: ${result.url}`);
} catch (error) {
  console.error('Failed to publish article:', error);
}
