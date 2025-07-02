const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const CommentLikesTableTestHelper = require("../../../../tests/CommentLikesTableTestHelper");

const CommentLikeRepositoryPostgres = require("../CommentLikeRepositoryPostgres");

const pool = require("../../database/postgres/pool");

const CommentLike = require("../../../Domains/comment_likes/entities/CommentLike");

describe("CommentLikeRepositoryPostgres", () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: "user-123" });
    await UsersTableTestHelper.addUser({
      id: "user-124",
      username: "test-124",
    });
    await ThreadsTableTestHelper.addThread({
      id: "thread-123",
      owner: "user-123",
    });
    await CommentsTableTestHelper.addComment({
      id: "comment-123",
      owner: "user-123",
      threadId: "thread-123",
    });
    await CommentsTableTestHelper.addComment({
      id: "comment-124",
      owner: "user-124",
      threadId: "thread-123",
    });
    await CommentsTableTestHelper.addComment({
      id: "comment-125",
      owner: "user-124",
      threadId: "thread-123",
    });
  });

  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe("saveCommentLike function", () => {
    it("should save like to database", async () => {
      // Arrange
      const commentLike = new CommentLike({
        userId: "user-123",
        commentId: "comment-123",
      });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool
      );

      // Action
      await commentLikeRepositoryPostgres.saveCommentLike(commentLike);

      // Assert
      const dbCommentLikes = await CommentLikesTableTestHelper.verifyLike(
        commentLike
      );
      expect(dbCommentLikes).toHaveLength(1);
    });
  });

  describe("checkCommentLike function", () => {
    const repository = new CommentLikeRepositoryPostgres(pool);
    // Arrange
    const commentLike = new CommentLike({
      userId: "user-123",
      commentId: "comment-123",
    });

    it("should return false when commentLike was not found", async () => {
      // Action
      const result = await repository.checkCommentLike(commentLike);

      // Assert
      expect(result).toEqual(false);
    });

    it("should return true when commentLike was exist", async () => {
      // Arrange
      await CommentLikesTableTestHelper.addLike(commentLike);

      // Action
      const result = await repository.checkCommentLike(commentLike);

      // Assert
      expect(result).toEqual(true);
    });
  });

  describe("deleteCommentLike function", () => {
    it("should delete commentLike from database", async () => {
      // Arrange
      const commentLike = new CommentLike({
        userId: "user-123",
        commentId: "comment-123",
      });

      await CommentLikesTableTestHelper.addLike(commentLike);

      const repository = new CommentLikeRepositoryPostgres(pool);

      // Action
      await repository.deleteCommentLike(commentLike);

      // Assert
      const dbCommentLike = await CommentLikesTableTestHelper.verifyLike(
        commentLike
      );
      expect(dbCommentLike).toHaveLength(0);
    });
  });

  describe("countCommentLikeByCommentId function", () => {
    it("should return total like on comments", async () => {
      // Arrange
      const payload = {
        commentIds: ["comment-123", "comment-124", "comment-125"],
      };

      await CommentLikesTableTestHelper.addLike({
        userId: "user-123",
        commentId: payload.commentIds[0],
      });
      await CommentLikesTableTestHelper.addLike({
        userId: "user-124",
        commentId: payload.commentIds[0],
      });
      await CommentLikesTableTestHelper.addLike({
        userId: "user-123",
        commentId: payload.commentIds[1],
      });

      const repository = new CommentLikeRepositoryPostgres(pool);

      // Action
      const result = await repository.countCommentLikeByCommentId(payload);

      // Assert
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Object);
      expect(result[payload.commentIds[0]]).toEqual(2);
      expect(result[payload.commentIds[1]]).toEqual(1);
      expect(result[payload.commentIds[2]]).toEqual(0);
    });
  });
});
