const DetailComment = require('../DetailComment');

describe('a DetailComment entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'text',
    };

    // Action and Assert
    expect(() => new DetailComment(payload)).toThrowError(
      'DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should create detailComment object correctly with isDeleted false', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'testing',
      date: new Date().toISOString(),
      content: 'this comment content',
      isDeleted: false,
      replies: [],
    };

    // Action
    const detailComment = new DetailComment(payload);

    // Assert
    expect(detailComment).toBeInstanceOf(DetailComment);
    expect(detailComment.id).toEqual(payload.id);
    expect(detailComment.username).toEqual(payload.username);
    expect(detailComment.date).toEqual(payload.date);
    expect(detailComment.content).toEqual(payload.content);
    expect(detailComment.replies).toBeInstanceOf(Array);
  });

  it('should replace content with "**komentar telah dihapus**" when isDeleted true', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'testing',
      date: new Date().toISOString(),
      content: 'this comment content',
      isDeleted: true,
      replies: [],
    };

    // Action
    const detailComment = new DetailComment(payload);

    // Assert
    expect(detailComment).toBeInstanceOf(DetailComment);
    expect(detailComment.id).toEqual(payload.id);
    expect(detailComment.username).toEqual(payload.username);
    expect(detailComment.date).toEqual(payload.date);
    expect(detailComment.content).toEqual('**komentar telah dihapus**');
    expect(detailComment.replies).toBeInstanceOf(Array);
  });

  it('should throw error when replies is not an array', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'testing',
      date: new Date().toISOString(),
      content: 'this comment content',
      isDeleted: true,
      replies: '[]',
    };

    // Action and Assert
    expect(() => new DetailComment(payload)).toThrowError(
      'DETAIL_COMMENT.INVALID_REPLIES_TYPE'
    );
  });
});
