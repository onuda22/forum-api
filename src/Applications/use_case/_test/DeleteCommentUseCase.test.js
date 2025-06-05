const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/thread/ThreadRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  // beforeEach()
  it('should throw error when payload not contain comment id', async () => {
    // Arrange
    const useCasePayload = {};
    const deleteCommentUseCase = new DeleteCommentUseCase({});

    // Action & Assert
    await expect(
      deleteCommentUseCase.execute(useCasePayload)
    ).rejects.toThrowError('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_COMMENT_ID');
  });

  it('should throw error if thread is not found', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      owner: 'user-123',
      threadId: 'thread-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThreadById = jest.fn().mockResolvedValue(null);

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Assert
    await expect(
      deleteCommentUseCase.execute(useCasePayload)
    ).rejects.toThrowError(
      new Error('DELETE_COMMENT_USE_CASE.THREAD_NOT_FOUND')
    );
  });

  it('should throw error if comment is not found', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      owner: 'user-123',
      threadId: 'thread-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ id: 'thread-123' }));
    mockCommentRepository.findCommentById = jest.fn().mockResolvedValue(null);

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Assert
    await expect(
      deleteCommentUseCase.execute(useCasePayload)
    ).rejects.toThrowError(
      new Error('DELETE_COMMENT_USE_CASE.COMMENT_NOT_FOUND')
    );
  });

  it('should throw error if comment id, owner or thread id is not string', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 123,
      owner: [],
      threadId: {},
    };
    const deleteCommentUseCase = new DeleteCommentUseCase({});

    // Action
    await expect(
      deleteCommentUseCase.execute(useCasePayload)
    ).rejects.toThrowError(
      'DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should throw error if comment is not belong to authentication user', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      owner: 'user-not-belong',
      threadId: 'thread-123',
    };

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // Mocking
    mockCommentRepository.findCommentById = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ id: 'comment-123', owner: 'user-123' })
      );
    mockThreadRepository.verifyThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ id: 'thread-123' }));
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action and Assert
    await expect(
      deleteCommentUseCase.execute(useCasePayload)
    ).rejects.toThrowError('DELETE_COMMENT_USE_CASE.FORBIDDEN_AUTHORIZATION');
    expect(mockCommentRepository.findCommentById).toHaveBeenCalledWith(
      useCasePayload
    );
    expect(mockThreadRepository.verifyThreadById).toHaveBeenCalledWith(
      useCasePayload
    );
  });

  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      owner: 'user-123',
      threadId: 'thread-123',
    };

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // Mocking
    mockCommentRepository.findCommentById = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ id: 'comment-123', owner: 'user-123' })
      );

    mockCommentRepository.deleteCommentById = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    mockThreadRepository.verifyThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ id: 'thread-123' }));

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockCommentRepository.findCommentById).toHaveBeenCalledWith(
      useCasePayload
    );
    expect(mockCommentRepository.deleteCommentById).toHaveBeenCalledWith(
      useCasePayload
    );
    expect(mockThreadRepository.verifyThreadById).toHaveBeenCalledWith(
      useCasePayload
    );
  });
});
