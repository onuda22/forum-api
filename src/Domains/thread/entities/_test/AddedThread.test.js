const AddedThread = require('../AddedThread');

describe('an AddedThred entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'text',
      owner: 'user-1232',
    };

    // Action and Assert
    expect(() => new AddedThread(payload)).toThrowError(
      'ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: true,
      title: [],
      owner: 123,
    };

    // Action and Assert
    expect(() => new AddedThread(payload)).toThrowError(
      'ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create addedThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-asdkjfha',
      title: 'test Title',
      owner: 'user-adlsfkjald',
    };

    // Action
    const addedThread = new AddedThread(payload);

    // Assert
    expect(addedThread).toBeInstanceOf(AddedThread);
    expect(addedThread.id).toEqual(payload.id);
    expect(addedThread.title).toEqual(payload.title);
    expect(addedThread.owner).toEqual(payload.owner);
  });
});
