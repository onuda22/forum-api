const LikeCommentUseCase = require("../../../../Applications/use_case/LikeCommentUseCase");

class CommentLikesHandler {
  constructor(container) {
    this._container = container;

    this.putCommentLikeHandler = this.putCommentLikeHandler.bind(this);
  }

  async putCommentLikeHandler(r, h) {
    const likeCommentUseCase = this._container.getInstance(
      LikeCommentUseCase.name
    );

    const { id: userId } = r.auth.credentials;
    const { threadId, commentId } = r.params;
    const payload = { userId, commentId, threadId };

    await likeCommentUseCase.execute(payload);
    const response = h.response({
      status: "success",
    });

    response.code(200);
    return response;
  }
}

module.exports = CommentLikesHandler;
