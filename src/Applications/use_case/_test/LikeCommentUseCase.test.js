const CommentLikeRepository = require("../../../Domains/comment_likes/CommentLikeRepository");
const CommentLike = require("../../../Domains/comment_likes/entities/CommentLike");
const LikeCommentUseCase = require("../LikeCommentUseCase");
const CommentRepository = require("../../../Domains/comments/CommentRepository");

describe("LikeCommentUseCase", () => {
  it("should throw error when comment is not found", async () => {
    // Arrange
    const useCasePayload = {
      userId: "user-123",
      commentId: "comment-123",
      threadId: "thread-123",
    };

    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    // Action
    mockCommentRepository.verifyCommentByThreadAndCommentId = jest
      .fn()
      .mockRejectedValue(new Error());

    // create use case
    const likeCommentUseCase = new LikeCommentUseCase({
      commentRepository: mockCommentRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Assert
    await expect(
      likeCommentUseCase.execute(useCasePayload)
    ).rejects.toThrowError(Error);

    expect(
      mockCommentRepository.verifyCommentByThreadAndCommentId
    ).toHaveBeenCalledWith({
      threadId: useCasePayload.threadId,
      commentId: useCasePayload.commentId,
    });
  });

  it("should orchestrating save like comment action correctly", async () => {
    // Arrange
    const useCasePayload = {
      userId: "user-123",
      commentId: "comment-123",
      threadId: "thread-123",
    };

    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    // Action
    mockCommentRepository.verifyCommentByThreadAndCommentId = jest
      .fn()
      .mockResolvedValue();
    mockCommentLikeRepository.checkCommentLike = jest
      .fn()
      .mockResolvedValue(false);
    mockCommentLikeRepository.saveCommentLike = jest.fn().mockResolvedValue();

    // create use case instance
    const likeCommentUseCase = new LikeCommentUseCase({
      commentRepository: mockCommentRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Action and Assert
    await expect(
      likeCommentUseCase.execute(useCasePayload)
    ).resolves.not.toThrowError(Error);

    expect(
      mockCommentRepository.verifyCommentByThreadAndCommentId
    ).toHaveBeenCalledWith({
      threadId: useCasePayload.threadId,
      commentId: useCasePayload.commentId,
    });
    expect(mockCommentLikeRepository.checkCommentLike).toHaveBeenCalledWith(
      new CommentLike({
        userId: useCasePayload.userId,
        commentId: useCasePayload.commentId,
      })
    );
    expect(mockCommentLikeRepository.saveCommentLike).toHaveBeenCalledWith(
      new CommentLike({
        userId: useCasePayload.userId,
        commentId: useCasePayload.commentId,
      })
    );
  });

  it("should orchestrating delete like comment action correctly", async () => {
    // Arrange
    const useCasePayload = {
      userId: "user-123",
      commentId: "comment-123",
      threadId: "thread-123",
    };

    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    // Action
    mockCommentRepository.verifyCommentByThreadAndCommentId = jest
      .fn()
      .mockResolvedValue();
    mockCommentLikeRepository.checkCommentLike = jest
      .fn()
      .mockResolvedValue(true);
    mockCommentLikeRepository.deleteCommentLike = jest.fn().mockResolvedValue();

    // create use case instance
    const likeCommentUseCase = new LikeCommentUseCase({
      commentRepository: mockCommentRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Action and Assert
    await expect(
      likeCommentUseCase.execute(useCasePayload)
    ).resolves.not.toThrowError(Error);

    expect(
      mockCommentRepository.verifyCommentByThreadAndCommentId
    ).toHaveBeenCalledWith({
      threadId: useCasePayload.threadId,
      commentId: useCasePayload.commentId,
    });
    expect(mockCommentLikeRepository.checkCommentLike).toHaveBeenCalledWith(
      new CommentLike({
        userId: useCasePayload.userId,
        commentId: useCasePayload.commentId,
      })
    );
    expect(mockCommentLikeRepository.deleteCommentLike).toHaveBeenCalledWith(
      new CommentLike({
        userId: useCasePayload.userId,
        commentId: useCasePayload.commentId,
      })
    );
  });
});
