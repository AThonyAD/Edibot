import { test } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { app } from './server.ts';

test('POST /api/media-titles - missing publisher_id', async () => {
  const res = await request(app)
    .post('/api/media-titles')
    .send({
      name: 'Test Title'
    });

  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(res.body, { error: 'Chybí ID vydavatele nebo název titulu' });
});

test('POST /api/media-titles - missing name', async () => {
  const res = await request(app)
    .post('/api/media-titles')
    .send({
      publisher_id: 1
    });

  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(res.body, { error: 'Chybí ID vydavatele nebo název titulu' });
});

test('POST /api/media-titles - valid request', async () => {
  const res = await request(app)
    .post('/api/media-titles')
    .send({
      publisher_id: 1,
      name: 'New Test Title',
      contact: 'test@example.com',
      default_price: 100,
      default_reach: 500,
      default_target_audience: 'Everyone',
      default_collaboration_type: 'Test'
    });

  assert.strictEqual(res.status, 200);
  assert.ok(res.body.id);
});
