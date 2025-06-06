const DetailComment = require('../../Domains/comments/entities/DetailComment');
const DetailThread = require('../../Domains/thread/entities/DetailThread');

class GetDetailThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(payload) {
    const thread = await this._threadRepository.getThreadById(payload);
    if (thread === undefined) {
      throw new Error('GET_DETAIL_THREAD_USE_CASE.THREAD_NOT_FOUND');
    }

    const getComments = await this._threadRepository.getCommentsByThreadId(
      payload
    );

    const comments = getComments.map((element) => {
      return new DetailComment(element);
    });

    const detailThread = new DetailThread({
      ...thread,
      comments,
    });

    return detailThread;
  }
}

module.exports = GetDetailThreadUseCase;
