/**
 * Example: Minimal HTTP server receiving Whapi webhooks and parsing incoming events.
 *
 * Run:
 *   node examples/webhook-example.js
 */
import http from 'node:http';
import { Whapi } from '../src/index.js';

const whapi = new Whapi({ token: 'test-token' });
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const event = whapi.webhooks.parse(body);

        if (event.hasMessages) {
          console.log(`Received ${event.messages.length} incoming message(s):`);
          for (const msg of event.messages) {
            console.log(`- From: ${msg.from}, Text: ${msg.text?.body || msg.body || '[media]'}`);
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
      } catch (err) {
        console.error('Webhook processing error:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`Webhook server listening on http://localhost:${PORT}/webhook`);
});
