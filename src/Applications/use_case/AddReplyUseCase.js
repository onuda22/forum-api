const Reply = require('../../Domains/reply/entities/Reply');

class AddReplyUseCase {
  constructor({ commentRepository, replyRepository }) {
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const newReply = new Reply(useCasePayload);
    const { threadId, commentId } = newReply;

    // Verify thread and comment
    await this._commentRepository.verifyCommentByThreadAndCommentId({
      threadId,
      commentId,
    });

    const addedReply = await this._replyRepository.addReply(newReply);

    return addedReply;
  }
}

module.exports = AddReplyUseCase;
