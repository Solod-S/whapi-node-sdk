import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ChannelsResource } from '../../src/resources/ChannelsResource.js';
import { MessagesResource } from '../../src/resources/MessagesResource.js';

describe('resources/ChannelsResource', () => {
  let capturedHttp;
  const mockHttp = {
    request: async (p) => {
      capturedHttp = p;
      if (p.path.endsWith('/messages')) {
        return {
          messages: [
            { id: 'post-1', timestamp: 100 },
            { id: 'post-2', timestamp: 200 },
          ],
        };
      }
      return { success: true };
    },
  };

  const messages = new MessagesResource(mockHttp);
  const channels = new ChannelsResource(mockHttp, messages);

  it('list() calls GET /newsletters', async () => {
    await channels.list({ count: 20 });
    assert.equal(capturedHttp.method, 'GET');
    assert.equal(capturedHttp.path, '/newsletters');
    assert.equal(capturedHttp.query.count, 20);
  });

  it('get() normalizes channel ID and calls GET /newsletters/{id}', async () => {
    await channels.get('120363123456789');
    assert.equal(capturedHttp.method, 'GET');
    assert.equal(capturedHttp.path, '/newsletters/120363123456789%40newsletter');
  });

  it('create() calls POST /newsletters', async () => {
    await channels.create({ name: 'Tech News', description: 'Daily updates' });
    assert.equal(capturedHttp.method, 'POST');
    assert.equal(capturedHttp.path, '/newsletters');
    assert.equal(capturedHttp.body.name, 'Tech News');
  });

  it('update() and delete() handle channel operations', async () => {
    await channels.update('120363123456789@newsletter', { description: 'Updated' });
    assert.equal(capturedHttp.method, 'PATCH');
    assert.equal(capturedHttp.path, '/newsletters/120363123456789%40newsletter');

    await channels.delete('120363123456789@newsletter');
    assert.equal(capturedHttp.method, 'DELETE');
    assert.equal(capturedHttp.path, '/newsletters/120363123456789%40newsletter');
  });

  it('subscribe and unsubscribe endpoints work', async () => {
    await channels.subscribe('120363123456789');
    assert.equal(capturedHttp.method, 'POST');
    assert.equal(capturedHttp.path, '/newsletters/120363123456789%40newsletter/subscription');

    await channels.unsubscribe('120363123456789');
    assert.equal(capturedHttp.method, 'DELETE');
    assert.equal(capturedHttp.path, '/newsletters/120363123456789%40newsletter/subscription');
  });

  it('invite subscriptions work', async () => {
    await channels.subscribeByInvite('code123');
    assert.equal(capturedHttp.method, 'POST');
    assert.equal(capturedHttp.path, '/newsletters/invite/code123/subscription');

    await channels.unsubscribeByInvite('code123');
    assert.equal(capturedHttp.method, 'DELETE');
    assert.equal(capturedHttp.path, '/newsletters/invite/code123/subscription');
  });

  it('find, getRecommended, getInviteLink, track, markPaidPartnership work', async () => {
    await channels.find({ search: 'news' });
    assert.equal(capturedHttp.path, '/newsletters/find');

    await channels.getRecommended({ country_code: 'UA' });
    assert.equal(capturedHttp.path, '/newsletters/recommended');

    await channels.getInviteLink('codeXYZ');
    assert.equal(capturedHttp.path, '/newsletters/link/codeXYZ');

    await channels.track('120363123456789');
    assert.equal(capturedHttp.path, '/newsletters/120363123456789%40newsletter/tracking');

    await channels.markPaidPartnership('120363123456789', 'post-1');
    assert.equal(
      capturedHttp.path,
      '/newsletters/120363123456789%40newsletter/messages/post-1/paid_partnership',
    );
  });

  it('getPosts() retrieves channel posts', async () => {
    const res = await channels.getPosts('120363123456789', { count: 50 });
    assert.equal(capturedHttp.method, 'GET');
    assert.equal(capturedHttp.path, '/newsletters/120363123456789%40newsletter/messages');
    assert.equal(res.messages.length, 2);
  });

  it('iteratePosts() yields posts and respects limits', async () => {
    const posts = [];
    for await (const post of channels.iteratePosts('120363123456789', { limit: 1 })) {
      posts.push(post);
    }
    assert.equal(posts.length, 1);
    assert.equal(posts[0].id, 'post-1');
  });

  it('publishText delegates to messages.sendText with normalized channel ID', async () => {
    await channels.publishText('120363123456789', 'Channel update');
    assert.equal(capturedHttp.method, 'POST');
    assert.equal(capturedHttp.path, '/messages/text');
    assert.equal(capturedHttp.body.to, '120363123456789@newsletter');
    assert.equal(capturedHttp.body.body, 'Channel update');
  });

  it('publishImage delegates to messages.sendImage with normalized channel ID', async () => {
    await channels.publishImage('120363123456789', 'https://example.com/banner.jpg', {
      caption: 'Breaking',
    });
    assert.equal(capturedHttp.method, 'POST');
    assert.equal(capturedHttp.path, '/messages/image');
    assert.equal(capturedHttp.body.to, '120363123456789@newsletter');
    assert.equal(capturedHttp.body.media, 'https://example.com/banner.jpg');
    assert.equal(capturedHttp.body.caption, 'Breaking');
  });

  it('publishLink delegates to messages.sendLinkPreview', async () => {
    await channels.publishLink('120363123456789', 'https://example.com/article', {
      title: 'Article Title',
    });
    assert.equal(capturedHttp.path, '/messages/link_preview');
    assert.equal(capturedHttp.body.to, '120363123456789@newsletter');
    assert.equal(capturedHttp.body.title, 'Article Title');
  });

  it('publishPoll, publishQuestion, publishQuiz delegate properly', async () => {
    await channels.publishPoll('120363123456789', {
      question: 'Poll Question',
      options: ['A', 'B'],
    });
    assert.equal(capturedHttp.path, '/messages/poll');
    assert.equal(capturedHttp.body.to, '120363123456789@newsletter');

    await channels.publishQuestion('120363123456789', 'A Question');
    assert.equal(capturedHttp.path, '/messages/question');
    assert.equal(capturedHttp.body.to, '120363123456789@newsletter');

    await channels.publishQuiz('120363123456789', {
      title: 'A Quiz',
      options: ['1', '2'],
      correct_option_index: 1,
    });
    assert.equal(capturedHttp.path, '/messages/quiz');
    assert.equal(capturedHttp.body.to, '120363123456789@newsletter');
  });

  it('publish generic dispatcher delegates to messages.send with normalized channel ID', async () => {
    await channels.publish('120363123456789', {
      type: 'text',
      text: 'Generic post',
    });
    assert.equal(capturedHttp.path, '/messages/text');
    assert.equal(capturedHttp.body.to, '120363123456789@newsletter');
    assert.equal(capturedHttp.body.body, 'Generic post');
  });
});
