const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/reply/ReplyRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should throw error if payload not contain needed property', async () => {
    // Arrange
    const useCasePayload = {};
    const deleteReplyUseCase = new DeleteReplyUseCase({});

    // Action and Assert
    await expect(
      deleteReplyUseCase.execute(useCasePayload)
    ).rejects.toThrowError('DELETE_REPLY_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if paylod not meet data type specification', async () => {
    // Arrange
    const useCasePayload = {
      owner: ['user-123'],
      replyId: true,
      commentId: {},
      threadId: 123,
    };

    const deleteReplyUseCase = new DeleteReplyUseCase({});

    // Action and Assert
    await expect(
      deleteReplyUseCase.execute(useCasePayload)
    ).rejects.toThrowError(
      'DELETE_REPLY_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should throw NotFoundError when thread or comment not found', async () => {
    // Arrange
    const useCasePayload = {
      owner: 'user-123',
      replyId: 'reply-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
    };

    const mockCommentRepository = new CommentRepository();
    const mockReplyRepositoy = new ReplyRepository();

    // Mocking
    mockCommentRepository.verifyCommentByThreadAndCommentId = jest
      .fn()
      .mockRejectedValue(new Error());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepositoy,
    });

    // Action and Assert
    await expect(
      deleteReplyUseCase.execute(useCasePayload)
    ).rejects.toThrowError(Error);
    expect(
      mockCommentRepository.verifyCommentByThreadAndCommentId
    ).toHaveBeenCalledWith(useCasePayload);
  });

  it('should throw NotFoundError when reply is not found', async () => {
    // Arrange
    const useCasePayload = {
      owner: 'user-123',
      replyId: 'reply-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
    };

    const mockCommentRepository = new CommentRepository();
    const mockReplyRepositoy = new ReplyRepository();

    // Mocking
    mockCommentRepository.verifyCommentByThreadAndCommentId = jest
      .fn()
      .mockResolvedValue();
    mockReplyRepositoy.verifyReplyByIdAndCommentId = jest
      .fn()
      .mockRejectedValue(new Error());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepositoy,
    });

    // Action and Assert
    await expect(
      deleteReplyUseCase.execute(useCasePayload)
    ).rejects.toThrowError(Error);
    expect(
      mockCommentRepository.verifyCommentByThreadAndCommentId
    ).toHaveBeenCalledWith(useCasePayload);
    expect(mockReplyRepositoy.verifyReplyByIdAndCommentId).toHaveBeenCalledWith(
      useCasePayload
    );
  });

  it('should throw AuthorizationError when user is not the owner of reply', async () => {
    // Arrange
    const useCasePayload = {
      owner: 'user-123',
      replyId: 'reply-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
    };

    const mockCommentRepository = new CommentRepository();
    const mockReplyRepositoy = new ReplyRepository();

    // Mocking
    mockCommentRepository.verifyCommentByThreadAndCommentId = jest
      .fn()
      .mockResolvedValue();
    mockReplyRepositoy.verifyReplyByIdAndCommentId = jest
      .fn()
      .mockResolvedValue();
    mockReplyRepositoy.verifyReplyOwner = jest
      .fn()
      .mockRejectedValue(new Error());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepositoy,
    });

    // Action and Assert
    await expect(
      deleteReplyUseCase.execute(useCasePayload)
    ).rejects.toThrowError(Error);
    expect(
      mockCommentRepository.verifyCommentByThreadAndCommentId
    ).toHaveBeenCalledWith(useCasePayload);
    expect(mockReplyRepositoy.verifyReplyByIdAndCommentId).toHaveBeenCalledWith(
      useCasePayload
    );
    expect(mockReplyRepositoy.verifyReplyOwner).toHaveBeenCalledWith(
      useCasePayload
    );
  });

  it('should orchestrating soft delete reply correctly', async () => {
    // Arrange
    const useCasePayload = {
      owner: 'user-123',
      replyId: 'reply-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
    };

    const mockCommentRepository = new CommentRepository();
    const mockReplyRepositoy = new ReplyRepository();

    // Mocking
    mockCommentRepository.verifyCommentByThreadAndCommentId = jest
      .fn()
      .mockResolvedValue();
    mockReplyRepositoy.verifyReplyByIdAndCommentId = jest
      .fn()
      .mockResolvedValue();
    mockReplyRepositoy.verifyReplyOwner = jest.fn().mockResolvedValue();
    mockReplyRepositoy.softDeleteReplyById = jest.fn().mockResolvedValue();

    const deleteReplyUseCase = new DeleteReplyUseCase({
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepositoy,
    });

    // Action and Assert
    await expect(
      deleteReplyUseCase.execute(useCasePayload)
    ).resolves.not.toThrowError(Error);
    expect(
      mockCommentRepository.verifyCommentByThreadAndCommentId
    ).toHaveBeenCalledWith(useCasePayload);
    expect(mockReplyRepositoy.verifyReplyByIdAndCommentId).toHaveBeenCalledWith(
      useCasePayload
    );
    expect(mockReplyRepositoy.verifyReplyOwner).toHaveBeenCalledWith(
      useCasePayload
    );
    expect(mockReplyRepositoy.softDeleteReplyById).toHaveBeenCalledWith(
      useCasePayload
    );
  });
});
