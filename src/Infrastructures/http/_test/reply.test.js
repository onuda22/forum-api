const CommentTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  const userAId = 'user-A-123';
  const userBId = 'user-B-123';
  const threadIdHelper = 'thread-A-123';
  const commentIdHelper = 'comment-A-123';
  const replyIdHelper = 'reply-A-123';

  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: userAId, username: 'userA' });
    await UsersTableTestHelper.addUser({ id: userBId, username: 'userb' });
    await ThreadsTableTestHelper.addThread({
      id: threadIdHelper,
      owner: userAId,
    });

    await CommentTableTestHelper.addComment({
      id: commentIdHelper,
      threadId: threadIdHelper,
      owner: userBId,
    });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  // Authentication
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

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 401 when user access route without correct token', async () => {
      // Arrange
      const requestPayload = {
        content: 'this is reply comment content',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadIdHelper}/comments/${commentIdHelper}/replies`,
        payload: requestPayload,
        headers: {
          authorization: `Bearer invalid-token`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        content: '',
      };

      const server = await createServer(container);
      const accessToken = await registerAndLoginUser(server);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadIdHelper}/comments/${commentIdHelper}/replies`,
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: [],
      };

      const server = await createServer(container);
      const accessToken = await registerAndLoginUser(server);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadIdHelper}/comments/${commentIdHelper}/replies`,
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 404 when thread or comment is not valid', async () => {
      // Arrange
      const requestPayload = {
        content: 'this is reply comment content',
      };

      const server = await createServer(container);
      const accessToken = await registerAndLoginUser(server);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/thread-invalid-id/comments/comment-invalid-id/replies`,
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 201 and persisted reply', async () => {
      // Arrange
      const requestPayload = {
        content: 'this is reply comment content',
      };

      const server = await createServer(container);
      const accessToken = await registerAndLoginUser(server);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadIdHelper}/comments/${commentIdHelper}/replies`,
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 401 when user access route without correct token', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadIdHelper}/comments/${commentIdHelper}/replies/${replyIdHelper}`,
        headers: {
          authorization: `Bearer invalid-token`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toBeDefined();
    });

    it('should response 404 when thread or comment is not found', async () => {
      // Arrange
      const server = await createServer(container);
      const accessToken = await registerAndLoginUser(server);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadIdHelper}/comments/${commentIdHelper}/replies/${replyIdHelper}`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 404 when reply is not found', async () => {
      // Arrange
      const server = await createServer(container);
      const accessToken = await registerAndLoginUser(server);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadIdHelper}/comments/${commentIdHelper}/replies/${replyIdHelper}`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it("should response 403 when user is not the reply's owner", async () => {
      // Arrange
      const server = await createServer(container);
      const accessToken = await registerAndLoginUser(server);

      // Create Reply
      await RepliesTableTestHelper.addReply({
        id: replyIdHelper,
        owner: userBId,
        commentId: commentIdHelper,
        threadId: threadIdHelper,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadIdHelper}/comments/${commentIdHelper}/replies/${replyIdHelper}`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 200 and give status success', async () => {
      // Arrange
      const server = await createServer(container);
      const accessToken = await registerAndLoginUser(server);

      // create reply
      const createReply = await server.inject({
        method: 'POST',
        url: `/threads/${threadIdHelper}/comments/${commentIdHelper}/replies`,
        payload: {
          content: 'this is comment content to delete',
        },
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
      const replyId = JSON.parse(createReply.payload).data.addedReply.id;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadIdHelper}/comments/${commentIdHelper}/replies/${replyId}`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
