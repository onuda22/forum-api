const CommentLikesTableTestHelper = require("../../../../tests/CommentLikesTableTestHelper");
const CommentTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const container = require("../../container");
const pool = require("../../database/postgres/pool");
const createServer = require("../createServer");

describe("/thread/:threadId/comment/:commentId/likes endpoint", () => {
  const userAId = "user-A-123";
  const userBId = "user-B-123";
  const threadIdHelper = "thread-A-123";
  const commentIdHelper = "comment-A-123";

  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: userAId, username: "userA" });
    await UsersTableTestHelper.addUser({ id: userBId, username: "userb" });
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
    await CommentLikesTableTestHelper.cleanTable();
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
      method: "POST",
      url: "/users",
      payload: {
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      },
    });

    /** Login User */
    const loginPayload = {
      username: "dicoding",
      password: "secret",
    };

    const loginResponse = await server.inject({
      method: "POST",
      url: "/authentications",
      payload: loginPayload,
    });

    const loginResponseJson = JSON.parse(loginResponse.payload);
    const { accessToken } = loginResponseJson.data;
    return accessToken;
  };

  describe("when PUT /likes", () => {
    it("should response 401 when user access route without correct token", async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "PUT",
        url: `/threads/${threadIdHelper}/comments/${commentIdHelper}/likes`,
        headers: {
          authorization: `Bearer invalid-token`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toBeDefined();
    });

    it("should response 404 when thread or comment is not valid", async () => {
      // Arrange
      const server = await createServer(container);
      const accessToken = await registerAndLoginUser(server);

      // Action
      const response = await server.inject({
        method: "PUT",
        url: `/threads/thread-invalid-id/comments/comment-invalid-id/likes`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toBeDefined();
    });

    it("should response 200 and success", async () => {
      // Arrange
      const server = await createServer(container);

      const accessToken = await registerAndLoginUser(server);

      const response = await server.inject({
        method: "PUT",
        url: `/threads/${threadIdHelper}/comments/${commentIdHelper}/likes`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
    });
  });
});
