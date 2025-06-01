const Comment = require('../Comment');

describe('Comment entities', () => {
  /**
   * Needed Property:
   * content: string
   * owner: string (user_id)
   * threadId: string (thread_id)
   *  */
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'this is comment content',
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new Comment(payload)).toThrowError(
      'COMMENT.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 123,
      owner: ['user-123'],
      threadId: true,
    };

    const anotherInvalidPayload = {
      content: '',
      owner: 'user-123',
      threadId: null,
    };

    // Action and Assert
    expect(() => new Comment(payload)).toThrowError(
      'COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create Comment object correctly', () => {
    // Arrange
    const paylod = {
      content: 'this is comment',
      owner: 'user-123',
      threadId: 'thread-123',
    };

    // Action
    const { content, owner, threadId } = new Comment(paylod);

    // Assert
    expect(content).toEqual(paylod.content);
    expect(owner).toEqual(paylod.owner);
    expect(threadId).toEqual(paylod.threadId);
  });
});
