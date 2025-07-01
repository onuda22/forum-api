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
    await ThreadsTableTestHelper.addThread({
      id: "thread-123",
      owner: "user-123",
    });
    await CommentsTableTestHelper.addComment({
      id: "comment-123",
      owner: "user-123",
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
      CommentLikesTableTestHelper.addLike(commentLike);

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

      CommentLikesTableTestHelper.addLike(commentLike);

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
});
