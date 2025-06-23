const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddedReply = require('../../../Domains/reply/entities/AddedReply');
const Reply = require('../../../Domains/reply/entities/Reply');
const ReplyRepository = require('../../../Domains/reply/ReplyRepository');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  it('should throw error when thread or comment are not found', async () => {
    // Arrange
    const useCasePayload = {
      content: 'content reply commnet',
      owner: 'user-123',
      commentId: 'comment-invalid-id',
      threadId: 'thread-invalid-id',
    };

    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    // Action
    mockCommentRepository.verifyCommentByThreadAndCommentId = jest
      .fn()
      .mockRejectedValue(new Error());

    // create add use case instance
    const addReplyUseCase = new AddReplyUseCase({
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Assert
    await expect(addReplyUseCase.execute(useCasePayload)).rejects.toThrowError(
      Error
    );
    
    expect(
      mockCommentRepository.verifyCommentByThreadAndCommentId
    ).toBeCalledWith({
      threadId: useCasePayload.threadId,
      commentId: useCasePayload.commentId,
    });
  });

  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'content reply commnet',
      owner: 'user-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
    };

    const mockAddedReply = new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    // Action
    mockCommentRepository.verifyCommentByThreadAndCommentId = jest
      .fn()
      .mockResolvedValue();
    mockReplyRepository.addReply = jest.fn().mockResolvedValue(mockAddedReply);

    // create add use case instance
    const addReplyUseCase = new AddReplyUseCase({
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const addedReply = await addReplyUseCase.execute(useCasePayload);

    // Assert
    expect(addedReply).toStrictEqual(
      new AddedReply({
        id: 'reply-123',
        content: useCasePayload.content,
        owner: useCasePayload.owner,
      })
    );

    expect(
      mockCommentRepository.verifyCommentByThreadAndCommentId
    ).toBeCalledWith({
      threadId: useCasePayload.threadId,
      commentId: useCasePayload.commentId,
    });

    expect(mockReplyRepository.addReply).toBeCalledWith(
      new Reply({
        content: useCasePayload.content,
        owner: useCasePayload.owner,
        commentId: useCasePayload.commentId,
        threadId: useCasePayload.threadId,
      })
    );
  });
});
