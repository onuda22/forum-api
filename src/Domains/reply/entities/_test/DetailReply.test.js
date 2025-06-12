const DetailReply = require('../DetailReply');

describe('A DetailReply Entity', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'test',
    };

    // Action and Assert
    expect(() => new DetailReply(payload)).toThrowError(
      'DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when paylod not meet data type specification', () => {
    // Arrange
    const payload = {
      id: true,
      content: [],
      username: 123,
      date: {},
      isDeleted: 'true',
    };

    // Action and Assert
    expect(() => new DetailReply(payload)).toThrowError(
      'DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create DetailReply object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'content',
      username: 'Usertesting',
      date: '2025-06-10T15:26:54.252Z',
      isDeleted: false,
    };

    // Action
    const detailReply = new DetailReply(payload);

    // Assert
    expect(detailReply).toEqual({
      id: payload.id,
      content: payload.content,
      username: payload.username,
      date: payload.date,
    });
  });

  it('should replace content with **balasan telah dihapus** if isDeleted equal true', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'content',
      username: 'Usertesting',
      date: '2025-06-10T15:26:54.252Z',
      isDeleted: true,
    };

    // Action
    const detailReply = new DetailReply(payload);

    // Assert
    expect(detailReply).toEqual({
      id: payload.id,
      content: '**balasan telah dihapus**',
      username: payload.username,
      date: payload.date,
    });
  });
});
