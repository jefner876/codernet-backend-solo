import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { clearTimeout } from 'timers';

describe('Messages (e2e)', () => {
  let app: INestApplication;
  jest.setTimeout(35000);
  let userId = '';
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    const testCreateAccount = {
      username: 'new user',
      email: '1234@gmail.com',
    };
    return request(app.getHttpServer())
      .post('/api/users')
      .send(testCreateAccount)
      .expect(201)
      .then(({ body }) => {
        const { newUser } = body;
        userId = newUser._id;
      });
  });
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    jest.clearAllTimers();
  });

  afterAll(async () => {
    await app.close();
    jest.clearAllTimers();
  });

  describe('POST', () => {
    test('201 status', () => {
      const testMessages = {
        body: 'Hello!',
        user: userId,
        room: 'Python',
      };
      return request(app.getHttpServer())
        .post('/api/messages')
        .send(testMessages)
        .expect(201)
        .then(({ body }) => {
          expect(body).toBeInstanceOf(Object);
          expect(body).toHaveProperty('newMessage');
          const { newMessage } = body;
          expect(newMessage).toHaveProperty('body', 'Hello!');
          expect(newMessage).toHaveProperty('_id', expect.any(String));
          expect(newMessage).toHaveProperty('created_at', expect.any(String));
          expect(newMessage).toHaveProperty('user', userId);
        });
    });
    test('400 status: malformed body', () => {
      const bodyWithWrongField = {
        body: 'Hello!',
        user: userId,
        room: 'Python',
        notafield: 'Zoink!',
      };
      return request(app.getHttpServer())
        .post('/api/messages')
        .send(bodyWithWrongField)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe('property notafield should not exist');
        });
    });
    test('400 status - id not valid', () => {
      const invalidUserId = {
        body: 'Hello!',
        user: 'notAnId',
        room: 'Python',
      };
      return request(app.getHttpServer())
        .post('/api/messages')
        .send(invalidUserId)
        .expect(400)
        .then(({ body: { message } }) => {
          expect(message).toBe('Invalid User ID');
        });
    });
  });

  describe('GET', () => {
    test('200 status', () => {
      return request(app.getHttpServer())
        .get('/api/messages')
        .expect(200)
        .then(({ body }) => {
          expect(body).toBeInstanceOf(Object);
          expect(body).toHaveProperty('messages');
          const { messages } = body;
          expect(messages).toBeInstanceOf(Array);
          expect(messages.length).toBeGreaterThan(0);

          messages.forEach((message) => {
            expect(message).toHaveProperty('body', expect.any(String));
            expect(message).toHaveProperty('created_at', expect.any(String));
            expect(message).toHaveProperty('user');
            const { user } = message;
            expect(user).toHaveProperty('_id', userId);
            expect(user).toHaveProperty('avatar');
            expect(user).toHaveProperty('username', 'new user');
            expect(user).toHaveProperty('email', '1234@gmail.com');
          });
        });
    });
  });

  describe('GET (by category)', () => {
    test('200 ', () => {
      const testMessagePython = {
        body: 'Hello Python!',
        user: userId,
        room: 'Python',
      };
      const testMessageJavascript = {
        body: 'Hello JS!',
        user: userId,
        room: 'Javascript',
      };
      return request(app.getHttpServer())
        .post('/api/messages')
        .send(testMessagePython)
        .expect(201)
        .then(() => {
          return request(app.getHttpServer())
            .post('/api/messages')
            .send(testMessageJavascript)
            .expect(201)
            .then(() => {
              return request(app.getHttpServer())
                .get('/api/messages/Python')
                .expect(200)
                .then(({ body }) => {
                  expect(body).toBeInstanceOf(Object);
                  expect(body).toHaveProperty('messages');
                  const { messages } = body;
                  expect(messages).toBeInstanceOf(Array);
                  expect(messages.length).toBeGreaterThan(0);
                  messages.forEach((message) => {
                    expect(message).toHaveProperty('room', 'Python');
                    expect(message).toHaveProperty('user');
                    const { user } = message;
                    expect(user).toHaveProperty('_id', userId);
                    expect(user).toHaveProperty('avatar');
                    expect(user).toHaveProperty('username', 'new user');
                    expect(user).toHaveProperty('email', '1234@gmail.com');
                  });
                  return request(app.getHttpServer())
                    .get('/api/messages/Javascript')
                    .expect(200)
                    .then(({ body }) => {
                      expect(body).toBeInstanceOf(Object);
                      expect(body).toHaveProperty('messages');
                      const { messages } = body;
                      expect(messages).toBeInstanceOf(Array);
                      expect(messages.length).toBeGreaterThan(0);
                      messages.forEach((message) => {
                        expect(message).toHaveProperty('room', 'Javascript');
                      });
                    });
                });
            });
        });
    });
  });
});
