class Reply {
  constructor(payload) {
    this._verifyPayload(payload);
    const { content, owner, commentId, threadId } = payload;

    this.content = content;
    this.owner = owner;
    this.commentId = commentId;
    this.threadId = threadId;
  }

  _verifyPayload({ content, owner, commentId, threadId }) {
    if (!content || !owner || !commentId || !threadId) {
      throw new Error('REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof content !== 'string' ||
      typeof owner !== 'string' ||
      typeof commentId !== 'string' ||
      typeof threadId !== 'string'
    ) {
      throw new Error('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Reply;
