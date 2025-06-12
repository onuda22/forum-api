const DetailComment = require('../../Domains/comments/entities/DetailComment');
const DetailThread = require('../../Domains/thread/entities/DetailThread');
const DetailReply = require('../../Domains/reply/entities/DetailReply');

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

    const commentIds = getComments.map((e) => e.id);

    const getReplies = await this._threadRepository.getRepliesByCommentId({
      commentIds,
    });

    // Grouping replies
    const mapReplies = {};
    for (const reply of getReplies) {
      if (!mapReplies[reply.commentId]) {
        mapReplies[reply.commentId] = [];
      }
      mapReplies[reply.commentId].push(
        new DetailReply({
          ...reply,
          date: new Date(reply.date).toISOString(),
        })
      );
    }

    // Mapping replies to comment
    const comments = getComments.map((comment) => {
      return new DetailComment({
        ...comment,
        replies: mapReplies[comment.id] || [],
      });
    });

    const detailThread = new DetailThread({
      ...thread,
      comments,
    });

    return detailThread;
  }
}

module.exports = GetDetailThreadUseCase;
