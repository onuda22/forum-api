const Comment = require('../../Domains/comments/entities/Comment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;
    await this._threadRepository.verifyThreadById({ threadId });

    const createComment = new Comment(useCasePayload);
    return this._commentRepository.addComment(createComment);
  }
}

module.exports = AddCommentUseCase;
