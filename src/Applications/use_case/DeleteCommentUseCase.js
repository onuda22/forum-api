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

    const thread = await this._threadRepository.verifyThreadById(payload);

    if (!thread) {
      throw new Error('DELETE_COMMENT_USE_CASE.THREAD_NOT_FOUND');
    }

    const comment = await this._commentRepository.findCommentById(payload);

    if (!comment) {
      throw new Error('DELETE_COMMENT_USE_CASE.COMMENT_NOT_FOUND');
    }

    if (comment.owner !== owner) {
      throw new Error('DELETE_COMMENT_USE_CASE.FORBIDDEN_AUTHORIZATION');
    }

    await this._commentRepository.deleteCommentById(payload);
  }
}

module.exports = DeleteCommentUseCase;
