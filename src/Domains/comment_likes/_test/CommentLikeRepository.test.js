const CommentLikeRepository = require("../CommentLikeRepository");

describe("A CommentLikeRepository interface", () => {
  it("should throw error when invoke abstract behavior", async () => {
    // Arrange
    const repository = new CommentLikeRepository();

    // Action and Assert
    await expect(repository.saveCommentLike("")).rejects.toThrowError(
      "COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(repository.deleteCommentLike("")).rejects.toThrowError(
      "COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
  });
});
