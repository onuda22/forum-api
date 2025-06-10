class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(payload) {
    const { commentId, owner, threadId } = payload;

    if (!commentId) {
      throw new Error('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_COMMENT_ID');
    }
    if (typeof commentId !== 'string' || typeof owner !== 'string') {
      throw new Error(
        'DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION'
      );
    }

    await this._threadRepository.verifyThreadById({ threadId });
    await this._commentRepository.verifyCommentByThreadAndCommentId(payload);
    await this._commentRepository.verifyCommentOwner({ commentId, owner });

    await this._commentRepository.deleteCommentById({ commentId });
  }
}

module.exports = DeleteCommentUseCase;
