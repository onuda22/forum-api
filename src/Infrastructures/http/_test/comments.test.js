const CommentTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('/comments endpoint', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'testing' });
  });

  afterEach(async () => {
    await CommentTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
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

  const createThread = async () => {
    /** Add Thread */
    const threadId = 'thread-123';
    await ThreadsTableTestHelper.addThread({ id: threadId, owner: 'user-123' });
    return threadId;
    // const threadResponse = await server.inject({
    //   method: 'POST',
    //   url: '/threads',
    //   payload: {
    //     title: 'sebuah thread',
    //     body: 'isi thread',
    //   },
    //   headers: {
    //     authorization: `Bearer ${accessToken}`,
    //   },
    // });

    // const responseJson = JSON.parse(threadResponse.payload);
    // return responseJson.data.addedThread.id;
  };

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'this is content',
      };

      const server = await createServer(container);

      const accessToken = await registerAndLoginUser(server);
      const threadId = await createThread();
      const existThread = await ThreadsTableTestHelper.findThreadById(threadId);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        content: '',
      };

      const server = await createServer(container);

      const accessToken = await registerAndLoginUser(server);
      const threadId = await createThread();

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
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
        'tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada'
      );
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: 123,
      };

      const server = await createServer(container);

      const accessToken = await registerAndLoginUser(server);
      const threadId = await createThread();

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
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
        'tidak dapat membuat komentar baru karena tipe data tidak sesuai'
      );
    });
  });
});
