class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute({ commentId, owner }) {
    if (!commentId) {
      throw new Error('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_COMMENT_ID');
    }
    if (typeof commentId !== 'string' || typeof owner !== 'string') {
      throw new Error(
        'DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION'
      );
    }

    const comment = await this._commentRepository.findCommentById(commentId);

    if (comment.owner !== owner) {
      throw new Error('DELETE_COMMENT_USE_CASE.FORBIDDEN_AUTHORIZATION');
    }

    await this._commentRepository.deleteCommentById(commentId);
  }
}

module.exports = DeleteCommentUseCase;
