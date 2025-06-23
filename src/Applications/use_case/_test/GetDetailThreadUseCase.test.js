const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');
const DetailThread = require('../../../Domains/thread/entities/DetailThread');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../../Domains/reply/entities/DetailReply');
const ThreadRepository = require('../../../Domains/thread/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/reply/ReplyRepository');

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
      {
        id: 'comment-B-123',
        username: 'testing',
        date: '2021-08-08T07:22:33.555Z',
        content: 'this is deleted content',
        isDeleted: true
      }
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
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    // Mocking
    mockThreadRepository.getThreadById = jest.fn().mockResolvedValue(getThread);
    mockCommentRepository.getCommentsByThreadId = jest
      .fn()
      .mockResolvedValue(getComments);
    mockReplyRepository.getRepliesByCommentId = jest
      .fn()
      .mockResolvedValue(getReplies);

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const result = await getDetailThreadUseCase.execute(useCasePayload);

    // Assert
    // Assert Thread Value
    expect(result).toBeInstanceOf(DetailThread);
    expect(result.id).toEqual(getThread.id);
    expect(result.title).toEqual(getThread.title);
    expect(result.body).toEqual(getThread.body);
    expect(result.date).toEqual(getThread.date);
    expect(result.username).toEqual(getThread.username);

    // Assert Comments Value
    expect(result.comments).toHaveLength(2);
    expect(result.comments[0]).toBeDefined();
    expect(result.comments[0]).toBeInstanceOf(DetailComment);
    expect(result.comments[0].id).toEqual(getComments[0].id);
    expect(result.comments[0].username).toEqual(getComments[0].username);
    expect(result.comments[0].date).toEqual(getComments[0].date);
    expect(result.comments[0].content).toEqual(getComments[0].content);

    expect(result.comments[1]).toBeDefined();
    expect(result.comments[1]).toBeInstanceOf(DetailComment);
    expect(result.comments[1].id).toEqual(getComments[1].id);
    expect(result.comments[1].username).toEqual(getComments[1].username);
    expect(result.comments[1].date).toEqual(getComments[1].date);
    expect(result.comments[1].content).toEqual('**komentar telah dihapus**');
    expect(result.comments[1].replies).toEqual([]);
    expect(result.comments[1].replies).toBeInstanceOf(Array)

    // Assert Replies Value
    expect(result.comments[0].replies).toHaveLength(2);
    // First Reply
    expect(result.comments[0].replies[0]).toBeDefined();
    expect(result.comments[0].replies[0]).toBeInstanceOf(DetailReply);
    expect(result.comments[0].replies[0].id).toEqual(getReplies[0].id);
    expect(result.comments[0].replies[0].date).toEqual(getReplies[0].date);
    expect(result.comments[0].replies[0].username).toEqual(
      getReplies[0].username
    );
    expect(result.comments[0].replies[0].content).toEqual(
      '**balasan telah dihapus**'
    );
    //Second Reply
    expect(result.comments[0].replies[1]).toBeDefined();
    expect(result.comments[0].replies[1]).toBeInstanceOf(DetailReply);
    expect(result.comments[0].replies[1].id).toEqual(getReplies[1].id);
    expect(result.comments[0].replies[1].date).toEqual(getReplies[1].date);
    expect(result.comments[0].replies[1].username).toEqual(
      getReplies[1].username
    );
    expect(result.comments[0].replies[1].content).toEqual(
      getReplies[1].content
    );

    // Make sure repo was called with exact value
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(
      useCasePayload
    );
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(
      useCasePayload
    );
    expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledWith({
      commentIds: getComments.map(comment => comment.id),
    });
  });
});
