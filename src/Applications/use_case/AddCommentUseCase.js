const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const Comment = require('../../Domains/comments/entities/Comment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const threadId = {
      id: useCasePayload.threadId,
    };
    const thread = await this._threadRepository.verifyThreadById(threadId);

    if (!thread) {
      throw new NotFoundError('Thread tidak ditemukan');
    }

    const createComment = new Comment(useCasePayload);
    return this._commentRepository.addComment(createComment);
  }
}

module.exports = AddCommentUseCase;
