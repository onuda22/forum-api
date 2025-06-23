const AddCommentUseCase = require('../AddCommentUseCase');
const Comment = require('../../../Domains/comments/entities/Comment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/thread/ThreadRepository');

describe('AddCommentUseCase', () => {
  /**
   * Check payload
   * Check exist thread
   * Push
   */
  it('should throw error when thread not found', async () => {
    // Arrange
    const useCasePayload = {
      content: 'this is content',
      owner: 'user-123',
      threadId: 'not-id',
    };

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // Action
    mockThreadRepository.verifyThreadById = jest.fn().mockResolvedValue();

    // create comment use case instance
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Assert
    await expect(
      addCommentUseCase.execute(useCasePayload)
    ).rejects.toThrowError(Error);
    expect(mockThreadRepository.verifyThreadById).toBeCalledWith({threadId: useCasePayload.threadId})
  });

  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'this is content',
      owner: 'user-123',
      threadId: 'thread-123',
    };

    const mockAddedComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // Mocking
    mockThreadRepository.verifyThreadById = jest
      .fn().mockResolvedValue();
    mockCommentRepository.addComment = jest
      .fn().mockResolvedValue(mockAddedComment);

    // create comment use case instance
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(useCasePayload);

    // Assert
    expect(addedComment).toStrictEqual(
      new AddedComment({
        id: 'comment-123',
        content: useCasePayload.content,
        owner: useCasePayload.owner,
      })
    );

    expect(mockCommentRepository.addComment).toBeCalledWith(
      new Comment({
        content: useCasePayload.content,
        owner: useCasePayload.owner,
        threadId: useCasePayload.threadId,
      })
    );
    expect(mockThreadRepository.verifyThreadById).toBeCalledWith({threadId: useCasePayload.threadId});
  });
});
