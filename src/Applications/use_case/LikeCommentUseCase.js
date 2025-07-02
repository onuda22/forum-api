const CommentLike = require("../../Domains/comment_likes/entities/CommentLike");

class LikeCommentUseCase {
  constructor({ commentRepository, commentLikeRepository }) {
    this._commentRepository = commentRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute(useCasePayload) {
    const commentLike = new CommentLike(useCasePayload);
    const { threadId, commentId } = useCasePayload;

    // check comment is exist
    await this._commentRepository.verifyCommentByThreadAndCommentId({
      threadId,
      commentId,
    });

    // check like comment
    const check = await this._commentLikeRepository.checkCommentLike(
      commentLike
    );

    if (check) {
      //like is exist then delete like
      await this._commentLikeRepository.deleteCommentLike(commentLike);
    } else {
      // like is not exist then save like
      await this._commentLikeRepository.saveCommentLike(commentLike);
    }
  }
}

module.exports = LikeCommentUseCase;
