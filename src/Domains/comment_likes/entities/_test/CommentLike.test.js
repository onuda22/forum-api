const CommentLike = require("../CommentLike");

describe("A CommentLike Entity", () => {
  it("should throw error when payload not contain needed Property", () => {
    const payload = {};

    expect(() => new CommentLike(payload)).toThrowError(
      "COMMENT_LIKE.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should create CommentLike object correctly", () => {
    const payload = {
      userId: "user-123",
      commentId: "comment-123",
    };

    const { userId, commentId } = new CommentLike(payload);

    expect(userId).toEqual(payload.userId);
    expect(commentId).toEqual(payload.commentId);
  });
});
