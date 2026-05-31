import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { app, db } from '../server.ts';

describe('Auth API Endpoints', () => {
  before(() => {
    // Clear out testing users
    db.exec("DELETE FROM users WHERE email LIKE 'test_%@example.com'");

    // Insert some test users
    db.exec(`
      INSERT INTO users (email, password, role, name, is_active) VALUES
      ('test_active@example.com', 'hashedpassword1', 'client', 'Active User', 1),
      ('test_inactive@example.com', 'hashedpassword2', 'client', 'Inactive User', 0)
    `);
  });

  after(() => {
    // Clean up
    db.exec("DELETE FROM users WHERE email LIKE 'test_%@example.com'");
  });

  test('POST /api/auth/login - valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test_active@example.com', password: 'hashedpassword1' });

    assert.strictEqual(response.status, 200);
    assert.ok(response.body.user);
    assert.strictEqual(response.body.user.email, 'test_active@example.com');
  });

  test('POST /api/auth/login - invalid password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test_active@example.com', password: 'wrongpassword' });

    assert.strictEqual(response.status, 401);
    assert.strictEqual(response.body.error, 'Nesprávné jméno nebo heslo');
  });

  test('POST /api/auth/login - non-existent user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'somepassword' });

    assert.strictEqual(response.status, 401);
    assert.strictEqual(response.body.error, 'Nesprávné jméno nebo heslo');
  });

  test('POST /api/auth/login - inactive user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test_inactive@example.com', password: 'hashedpassword2' });

    assert.strictEqual(response.status, 403);
    assert.strictEqual(response.body.error, 'Uživatelský účet je deaktivován');
  });
});
