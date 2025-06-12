const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');
const DetailThread = require('../../../Domains/thread/entities/DetailThread');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../../Domains/reply/entities/DetailReply');
const ThreadRepository = require('../../../Domains/thread/ThreadRepository');

describe('GetDetailThreadUseCase', () => {
  it('should throw error when thread not found', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-notValid',
    };

    const mockThreadRepository = new ThreadRepository();

    // Action
    mockThreadRepository.getThreadById = jest.fn().mockResolvedValue(undefined);

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Assert
    await expect(
      getDetailThreadUseCase.execute(useCasePayload)
    ).rejects.toThrowError(
      new Error('GET_DETAIL_THREAD_USE_CASE.THREAD_NOT_FOUND')
    );
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload);
  });

  it('should orchestrating get thread detail ation correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const getThread = {
      id: 'thread-123',
      title: 'this is title',
      body: 'this is body',
      date: '2021-08-08T07:22:33.555Z',
      username: 'testing',
    };

    const getComments = [
      {
        id: 'comment-123',
        username: 'testing-1',
        date: '2021-08-08T07:22:33.555Z',
        content: 'this is content',
        isDeleted: false,
      },
    ];

    const getReplies = [
      {
        id: 'reply-A-123',
        username: 'userA',
        date: '2021-08-08T07:22:33.555Z',
        content: 'reply content',
        commentId: 'comment-123',
        isDeleted: true,
      },
      {
        id: 'reply-B-123',
        username: 'userB',
        date: '2021-08-08T07:22:33.555Z',
        content: 'reply comment content',
        commentId: 'comment-123',
        isDeleted: false,
      },
    ];

    const mockThreadRepository = new ThreadRepository();

    // Mocking
    mockThreadRepository.getThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(getThread));
    mockThreadRepository.getCommentsByThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve(getComments));
    mockThreadRepository.getRepliesByCommentId = jest
      .fn()
      .mockResolvedValue(getReplies);

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const result = await getDetailThreadUseCase.execute(useCasePayload);

    // Assert
    expect(result).toBeInstanceOf(DetailThread);
    expect(result.id).toEqual(useCasePayload.threadId);
    expect(result.comments).toHaveLength(1);
    expect(result.comments[0]).toBeDefined();
    expect(result.comments[0]).toBeInstanceOf(DetailComment);
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(
      useCasePayload
    );
    expect(mockThreadRepository.getCommentsByThreadId).toHaveBeenCalledWith(
      useCasePayload
    );
    expect(result.comments[0].replies).toHaveLength(2);
    expect(result.comments[0].replies[0]).toBeDefined();
    expect(result.comments[0].replies[1]).toBeDefined();
    expect(result.comments[0].replies[0]).toBeInstanceOf(DetailReply);
    expect(result.comments[0].replies[1]).toBeInstanceOf(DetailReply);
    expect(result.comments[0].replies[0].content).toEqual(
      '**balasan telah dihapus**'
    );
    expect(mockThreadRepository.getRepliesByCommentId).toHaveBeenCalledWith({
      commentIds: [getComments[0].id],
    });
  });
});
