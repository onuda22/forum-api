const CommentRepository = require('../../../Domains/comments/CommentRepository');
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

  it('should throw error if comment id or owner is not string', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 123,
      owner: [],
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
    };

    const mockCommentRepository = new CommentRepository();

    // Mocking
    mockCommentRepository.findCommentById = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ id: 'comment-123', owner: 'user-123' })
      );
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action and Assert
    await expect(
      deleteCommentUseCase.execute(useCasePayload)
    ).rejects.toThrowError('DELETE_COMMENT_USE_CASE.FORBIDDEN_AUTHORIZATION');
    expect(mockCommentRepository.findCommentById).toHaveBeenCalledWith(
      useCasePayload.commentId
    );
  });

  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const mockCommentRepository = new CommentRepository();

    // Mocking
    mockCommentRepository.findCommentById = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ id: 'comment-123', owner: 'user-123' })
      );

    mockCommentRepository.deleteCommentById = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockCommentRepository.findCommentById).toHaveBeenCalledWith(
      useCasePayload.commentId
    );
    expect(mockCommentRepository.deleteCommentById).toHaveBeenCalledWith(
      useCasePayload.commentId
    );
  });
});
