import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MessagesResource } from '../../src/resources/MessagesResource.js';
import { WhapiValidationError } from '../../src/core/errors.js';

describe('resources/MessagesResource', () => {
  let captured;
  const mockHttp = {
    request: async (p) => {
      captured = p;
      return { sent: true, message: { id: 'msg-123' } };
    },
  };
  const messages = new MessagesResource(mockHttp);

  it('sendText sends POST /messages/text', async () => {
    await messages.sendText('12345678901', 'Hello world', { typing_time: 2 });
    assert.equal(captured.method, 'POST');
    assert.equal(captured.path, '/messages/text');
    assert.equal(captured.body.to, '12345678901');
    assert.equal(captured.body.body, 'Hello world');
    assert.equal(captured.body.typing_time, 2);
  });

  it('sendImage sends POST /messages/image', async () => {
    await messages.sendImage('12345678901', 'https://example.com/photo.jpg', {
      caption: 'Photo caption',
    });
    assert.equal(captured.method, 'POST');
    assert.equal(captured.path, '/messages/image');
    assert.equal(captured.body.to, '12345678901');
    assert.equal(captured.body.media, 'https://example.com/photo.jpg');
    assert.equal(captured.body.caption, 'Photo caption');
  });

  it('sendVideo sends POST /messages/video', async () => {
    await messages.sendVideo('12345678901', 'https://example.com/video.mp4', {
      caption: 'Video caption',
    });
    assert.equal(captured.method, 'POST');
    assert.equal(captured.path, '/messages/video');
    assert.equal(captured.body.media, 'https://example.com/video.mp4');
  });

  it('sendShortVideo sends POST /messages/short', async () => {
    await messages.sendShortVideo('12345678901', 'https://example.com/round.mp4');
    assert.equal(captured.method, 'POST');
    assert.equal(captured.path, '/messages/short');
    assert.equal(captured.body.media, 'https://example.com/round.mp4');
  });

  it('sendGif sends POST /messages/gif', async () => {
    await messages.sendGif('12345678901', 'https://example.com/funny.gif');
    assert.equal(captured.method, 'POST');
    assert.equal(captured.path, '/messages/gif');
  });

  it('sendAudio sends POST /messages/audio', async () => {
    await messages.sendAudio('12345678901', 'https://example.com/audio.mp3');
    assert.equal(captured.method, 'POST');
    assert.equal(captured.path, '/messages/audio');
  });

  it('sendVoice sends POST /messages/voice', async () => {
    await messages.sendVoice('12345678901', 'https://example.com/voice.ogg');
    assert.equal(captured.method, 'POST');
    assert.equal(captured.path, '/messages/voice');
  });

  it('sendDocument sends POST /messages/document', async () => {
    await messages.sendDocument('12345678901', 'https://example.com/doc.pdf', {
      filename: 'report.pdf',
    });
    assert.equal(captured.method, 'POST');
    assert.equal(captured.path, '/messages/document');
    assert.equal(captured.body.filename, 'report.pdf');
  });

  it('sendLinkPreview sends POST /messages/link_preview', async () => {
    await messages.sendLinkPreview('12345678901', 'https://example.com/article', {
      title: 'Breaking news',
      description: 'News details',
    });
    assert.equal(captured.method, 'POST');
    assert.equal(captured.path, '/messages/link_preview');
    assert.equal(captured.body.body, 'https://example.com/article');
    assert.equal(captured.body.title, 'Breaking news');
    assert.equal(captured.body.description, 'News details');
  });

  it('sendLocation sends POST /messages/location', async () => {
    await messages.sendLocation('12345678901', {
      latitude: 50.4501,
      longitude: 30.5234,
      name: 'Kyiv',
    });
    assert.equal(captured.method, 'POST');
    assert.equal(captured.path, '/messages/location');
    assert.equal(captured.body.latitude, 50.4501);
  });

  it('sendLiveLocation sends POST /messages/live_location', async () => {
    await messages.sendLiveLocation('12345678901', {
      latitude: 50.4501,
      longitude: 30.5234,
    });
    assert.equal(captured.method, 'POST');
    assert.equal(captured.path, '/messages/live_location');
  });

  it('sendContact sends POST /messages/contact', async () => {
    await messages.sendContact('12345678901', { name: 'John Doe', vcard: 'BEGIN:VCARD...' });
    assert.equal(captured.method, 'POST');
    assert.equal(captured.path, '/messages/contact');
    assert.equal(captured.body.name, 'John Doe');
  });

  it('sendPoll sends POST /messages/poll', async () => {
    await messages.sendPoll('120363123456789@newsletter', {
      question: 'Which framework do you prefer?',
      options: ['Node.js', 'Bun', 'Deno'],
    });
    assert.equal(captured.method, 'POST');
    assert.equal(captured.path, '/messages/poll');
    assert.equal(captured.body.title, 'Which framework do you prefer?');
    assert.deepEqual(captured.body.options, ['Node.js', 'Bun', 'Deno']);
  });

  it('sendQuestion sends POST /messages/question', async () => {
    await messages.sendQuestion('120363123456789@newsletter', 'What are your thoughts?');
    assert.equal(captured.method, 'POST');
    assert.equal(captured.path, '/messages/question');
    assert.equal(captured.body.body, 'What are your thoughts?');
  });

  it('sendQuiz sends POST /messages/quiz', async () => {
    await messages.sendQuiz('120363123456789@newsletter', {
      title: 'Capital of Ukraine?',
      options: ['Kyiv', 'Lviv', 'Odesa'],
      correct_option_index: 0,
    });
    assert.equal(captured.method, 'POST');
    assert.equal(captured.path, '/messages/quiz');
    assert.equal(captured.body.title, 'Capital of Ukraine?');
    assert.equal(captured.body.correct_option_index, 0);
  });

  it('sendQuiz validates correct_option_index bounds', async () => {
    await assert.rejects(
      () =>
        messages.sendQuiz('120363123456789@newsletter', {
          title: 'Quiz',
          options: ['A', 'B'],
          correct_option_index: 5,
        }),
      WhapiValidationError,
    );
  });

  it('dispatcher send() dispatches text and image correctly', async () => {
    await messages.send({
      to: '12345678901',
      type: 'text',
      text: 'From dispatcher',
    });
    assert.equal(captured.path, '/messages/text');
    assert.equal(captured.body.body, 'From dispatcher');

    await messages.send({
      to: '12345678901',
      type: 'image',
      media: 'https://example.com/img.jpg',
      caption: 'Disp image',
    });
    assert.equal(captured.path, '/messages/image');
    assert.equal(captured.body.caption, 'Disp image');
  });

  it('dispatcher send() throws WhapiValidationError on unknown type', async () => {
    await assert.rejects(
      () =>
        messages.send({
          to: '12345678901',
          type: 'telepathy',
        }),
      WhapiValidationError,
    );
  });

  it('list, listByChat, get, delete work as expected', async () => {
    await messages.list({ count: 20 });
    assert.equal(captured.method, 'GET');
    assert.equal(captured.path, '/messages/list');
    assert.equal(captured.query.count, 20);

    await messages.listByChat('12345678901', { count: 10 });
    assert.equal(captured.path, '/messages/list/12345678901');

    await messages.get('msg-abc');
    assert.equal(captured.path, '/messages/msg-abc');

    await messages.delete('msg-abc');
    assert.equal(captured.method, 'DELETE');
    assert.equal(captured.path, '/messages/msg-abc');
  });
});
