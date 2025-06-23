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

    mockThreadRepository.verifyThreadById = jest
      .fn()
      .mockRejectedValue(new Error('thread tidak ditemukan'));

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Assert
    await expect(
      deleteCommentUseCase.execute(useCasePayload)
    ).rejects.toThrowError('thread tidak ditemukan');
    expect(mockThreadRepository.verifyThreadById).toHaveBeenCalledTimes(1);
    expect(mockThreadRepository.verifyThreadById).toHaveBeenCalledWith({
      threadId: useCasePayload.threadId,
    });
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

    mockThreadRepository.verifyThreadById = jest.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentByThreadAndCommentId = jest
      .fn()
      .mockRejectedValue(new Error('comment tidak ditemukan'));

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Assert
    await expect(
      deleteCommentUseCase.execute(useCasePayload)
    ).rejects.toThrowError('comment tidak ditemukan');
    expect(mockThreadRepository.verifyThreadById).toHaveBeenCalledWith({
      threadId: useCasePayload.threadId,
    });
    expect(
      mockCommentRepository.verifyCommentByThreadAndCommentId
    ).toHaveBeenCalledWith(useCasePayload);
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
    mockThreadRepository.verifyThreadById = jest.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentByThreadAndCommentId = jest
      .fn()
      .mockResolvedValue();
    mockCommentRepository.verifyCommentOwner = jest
      .fn()
      .mockRejectedValue(new Error());
    
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action and Assert
    await expect(
      deleteCommentUseCase.execute(useCasePayload)
    ).rejects.toThrowError(Error);
    expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledTimes(1);
    expect(mockThreadRepository.verifyThreadById).toHaveBeenCalledTimes(1);
    expect(
      mockCommentRepository.verifyCommentByThreadAndCommentId
    ).toHaveBeenCalledTimes(1);
    
    expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledWith({
      commentId: useCasePayload.commentId,
      owner: useCasePayload.owner,
    });
    expect(mockThreadRepository.verifyThreadById).toHaveBeenCalledWith({
      threadId: useCasePayload.threadId,
    });
    expect(
      mockCommentRepository.verifyCommentByThreadAndCommentId
    ).toHaveBeenCalledWith(useCasePayload);
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
    mockThreadRepository.verifyThreadById = jest.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentByThreadAndCommentId = jest
      .fn()
      .mockResolvedValue();
    mockCommentRepository.verifyCommentOwner = jest.fn().mockResolvedValue();
    mockCommentRepository.deleteCommentById = jest.fn().mockResolvedValue();

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadById).toHaveBeenCalledWith({
      threadId: useCasePayload.threadId,
    });
    expect(
      mockCommentRepository.verifyCommentByThreadAndCommentId
    ).toHaveBeenCalledWith(useCasePayload);
    expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledWith({
      commentId: useCasePayload.commentId,
      owner: useCasePayload.owner,
    });
    expect(mockCommentRepository.deleteCommentById).toHaveBeenCalledWith({
      commentId: useCasePayload.commentId,
    });
  });
});
