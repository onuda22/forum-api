const NewThread = require('../../../Domains/thread/entities/NewThread');
const AddedThread = require('../../../Domains/thread/entities/AddedThread');
const ThreadRepository = require('../../../Domains/thread/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrating the add user action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'A new Thread Discussion',
      body: 'the issues in this test case',
      owner: 'user-123',
    };

    const mockAddedThread = new AddedThread({
      id: 'thread-newThread1',
      title: useCasePayload.title,
      owner: 'user-123',
    });

    const mockThreadRepository = new ThreadRepository();

    // Mocking
    mockThreadRepository.addThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockAddedThread));

    // create thread use case instance
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedThread = await addThreadUseCase.execute(useCasePayload);

    // Assert
    expect(addedThread).toStrictEqual(
      new AddedThread({
        id: 'thread-newThread1',
        title: useCasePayload.title,
        owner: 'user-123',
      })
    );

    expect(mockThreadRepository.addThread).toBeCalledWith(
      new NewThread({
        title: useCasePayload.title,
        body: useCasePayload.body,
        owner: useCasePayload.owner,
      })
    );
  });
});
