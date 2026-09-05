/**
 * Example: Publishing interactive Polls, Quizzes, and Questions to a WhatsApp Channel.
 *
 * Run:
 *   node --env-file=.env examples/send-interactive.js
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
  // 1. Send Poll
  console.log('Sending poll to channel...');
  const pollResponse = await whapi.channels.publishPoll(channelId, {
    question: 'Which Node.js version are you running in production?',
    options: ['Node.js 20 LTS', 'Node.js 22 LTS', 'Node.js 24 (Current)', 'Other'],
    multiple_answers: false,
  });
  console.log('Poll sent:', pollResponse);

  // 2. Send Quiz
  console.log('Sending trivia quiz to channel...');
  const quizResponse = await whapi.channels.publishQuiz(channelId, {
    title: 'What year was Node.js originally released?',
    options: ['2007', '2009', '2011', '2015'],
    correct_option_index: 1, // 2009
  });
  console.log('Quiz sent:', quizResponse);

  // 3. Send Question card
  console.log('Sending question prompt to channel...');
  const questionResponse = await whapi.channels.publishQuestion(
    channelId,
    'What features would you like to see next in our WhatsApp SDK?',
  );
  console.log('Question sent:', questionResponse);
} catch (error) {
  console.error('Failed to send interactive post:', error);
}
