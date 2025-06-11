class DeleteReplyUseCase {
  constructor({ commentRepository, replyRepository }) {
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    // Verify Payload
    this._verifyPayload(useCasePayload);

    // Validate thread and comment
    await this._commentRepository.verifyCommentByThreadAndCommentId(
      useCasePayload
    );

    // Validate reply
    await this._replyRepository.verifyReplyByIdAndCommentId(useCasePayload);

    // Validate reply owner
    await this._replyRepository.verifyReplyOwner(useCasePayload);

    // Soft Delete Reply
    await this._replyRepository.softDeleteReplyById(useCasePayload);
  }

  _verifyPayload({ replyId, owner, commentId, threadId }) {
    if (!replyId || !owner || !commentId || !threadId) {
      throw new Error('DELETE_REPLY_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }
    if (
      typeof replyId !== 'string' ||
      typeof owner !== 'string' ||
      typeof commentId !== 'string' ||
      typeof threadId !== 'string'
    ) {
      throw new Error('DELETE_REPLY_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteReplyUseCase;
