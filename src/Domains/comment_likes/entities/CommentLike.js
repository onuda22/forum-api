class CommentLike {
  constructor(payload) {
    this._verifyPayload(payload);

    const { userId, commentId } = payload;
    this.userId = userId;
    this.commentId = commentId;
  }

  _verifyPayload({ userId, commentId }) {
    if (!userId || !commentId) {
      throw new Error("COMMENT_LIKE.NOT_CONTAIN_NEEDED_PROPERTY");
    }
  }
}

module.exports = CommentLike;
