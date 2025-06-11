const Reply = require('../Reply');

describe('A Reply entity', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'content',
    };

    // Action and Assert
    expect(() => new Reply(payload)).toThrowError(
      'REPLY.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });
  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 1,
      owner: ['owner'],
      commentId: true,
      threadId: {},
    };

    // Action and Assert
    expect(() => new Reply(payload)).toThrowError(
      'REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });
  it('should return Reply object correctly', () => {
    // Arrange
    const payload = {
      content: 'reply content',
      owner: 'user-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
    };

    // Action
    const reply = new Reply(payload);

    // Assert
    expect(reply).toStrictEqual(
      new Reply({
        content: payload.content,
        owner: payload.owner,
        commentId: payload.commentId,
        threadId: payload.threadId,
      })
    );
  });
});
