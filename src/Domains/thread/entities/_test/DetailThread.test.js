const DetailThread = require('../DetailThread');

describe('a DetailThread entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'text',
    };

    // Action and Assert
    expect(() => new DetailThread(payload)).toThrowError(
      'DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when comments in payload is not an array', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'this is thread title',
      body: 'this is body',
      date: new Date().toISOString(),
      username: 'testing',
      comments: '',
    };

    // Action and Assert
    expect(() => new DetailThread(payload)).toThrowError(
      'DETAIL_THREAD.INVALID_COMMENTS_TYPE'
    );
  });

  it('should create detailThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'this is thread title',
      body: 'this is body',
      date: new Date().toISOString(),
      username: 'testing',
      comments: [{}, {}],
    };

    // Action
    const detailThread = new DetailThread(payload);

    // Assert
    expect(detailThread).toBeInstanceOf(DetailThread);
    expect(detailThread.id).toEqual(payload.id);
    expect(detailThread.title).toEqual(payload.title);
    expect(detailThread.body).toEqual(payload.body);
    expect(detailThread.date).toEqual(payload.date);
    expect(detailThread.username).toEqual(payload.username);
    expect(detailThread.comments).toBeInstanceOf(Array);
  });
});
