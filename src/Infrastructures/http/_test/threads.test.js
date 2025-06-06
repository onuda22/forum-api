const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const container = require('../../container');
const CommentTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('/threads endpoint', () => {
  afterEach(async () => {
    await CommentTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  const registerAndLoginUser = async (server) => {
    /** Register User */
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      },
    });

    /** Login User */
    const loginPayload = {
      username: 'dicoding',
      password: 'secret',
    };

    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: loginPayload,
    });

    const loginResponseJson = JSON.parse(loginResponse.payload);
    const { accessToken } = loginResponseJson.data;
    return accessToken;
  };

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'Thread Title',
        body: 'The content of Thread',
      };

      const server = await createServer(container);

      const accessToken = await registerAndLoginUser(server);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        body: 'this is body',
      };

      const server = await createServer(container);

      const accessToken = await registerAndLoginUser(server);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada'
      );
    });

    it('should response 400 when request payload not meet data type sepcification', async () => {
      // Arrange
      const requestPayload = {
        title: true,
        body: ['test'],
      };

      const server = await createServer(container);
      const accessToken = await registerAndLoginUser(server);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat thread karena tipe data tidak sesuai'
      );
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and give persisted thread with comment', async () => {
      // Arrange
      // Create thread and comment
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await UsersTableTestHelper.addUser({
        id: 'user-234',
        username: 'testing',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-X123',
        owner: 'user-123',
      });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-234',
        threadId: 'thread-X123',
        isDeleted: true,
      });
      await CommentTableTestHelper.addComment({
        id: 'comment-234',
        owner: 'user-123',
        threadId: 'thread-X123',
      });
      const requestParams = {
        threadId: 'thread-X123',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${requestParams.threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.id).toEqual(requestParams.threadId);
      expect(responseJson.data.thread.comments).toBeInstanceOf(Array);
      expect(responseJson.data.thread.comments[0].content).toEqual(
        '**komentar telah dihapus**'
      );
    });
    it('should response 404 when threadId invalid', async () => {
      // Arrange
      const requestParams = {
        threadId: 'thread-invalid',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${requestParams.threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'thread tidak ditemukan, threadId invalid'
      );
    });
  });
});
