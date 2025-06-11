// Domain
const Reply = require('../../../Domains/reply/entities/Reply');
const AddedReply = require('../../../Domains/reply/entities/AddedReply');

// Helper
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

// Repo
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ReplyRepositoryPostgres', () => {
  const userAId = 'user-A-123';
  const userBId = 'user-B-123';
  const threadIdHelper = 'thread-123';
  const commentIdHelper = 'comment-123';

  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: userAId });
    await UsersTableTestHelper.addUser({ id: userBId, username: 'userb' });
    await ThreadsTableTestHelper.addThread({
      id: threadIdHelper,
      owner: userAId,
    });
    await CommentTableTestHelper.addComment({
      id: commentIdHelper,
      threadId: threadIdHelper,
      owner: userBId,
    });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addReply function', () => {
    // Arrange
    const newReply = new Reply({
      content: 'content reply',
      owner: userAId,
      commentId: commentIdHelper,
      threadId: threadIdHelper,
    });

    const fakeIdGenerator = () => '123';
    const replyRepository = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

    let addedReply;
    beforeAll(async () => {
      // Action
      addedReply = await replyRepository.addReply(newReply);
    });

    it('should add reply to database and realy exist in database', async () => {
      // Assert
      const existReply = await RepliesTableTestHelper.findReplyById(
        'reply-123'
      );
      expect(existReply).toHaveLength(1);
    });

    it('should return the AddedReply object correctly', async () => {
      // Assert
      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: 'reply-123',
          content: 'content reply',
          owner: userAId,
        })
      );
    });
  });

  describe('softDeleteReplyById function', () => {
    it('should soft delete reply correctly, make is_deleted equal true', async () => {
      // Arrange
      const payload = {
        replyId: 'reply-123',
      };

      await RepliesTableTestHelper.addReply({
        content: 'content reply want to delete',
        owner: userAId,
        commentId: commentIdHelper,
        isDeleted: false,
      });

      const replyRepository = new ReplyRepositoryPostgres(pool, {});

      // Action
      replyRepository.softDeleteReplyById(payload);

      // Assert
      const reply = await RepliesTableTestHelper.findReplyById(payload.replyId);

      expect(reply[0].is_deleted).toStrictEqual(true);
    });
  });

  describe('verifyReplyOwner function', () => {
    // Arrange
    const payload = {
      replyId: 'reply-123',
      owner: userAId,
    };

    const replyRepository = new ReplyRepositoryPostgres(pool, {});

    it('should return AuthorizationError when user not owner of reply', async () => {
      await RepliesTableTestHelper.addReply({
        id: payload.replyId,
        owner: userBId,
        commentId: commentIdHelper,
      });

      // Action and Assert
      await expect(
        replyRepository.verifyReplyOwner(payload)
      ).rejects.toThrowError(
        new AuthorizationError('akses ditolak user bukan pemilik reply')
      );
    });

    it("should not throw AuthorizationError when user is the reply's owner", async () => {
      await RepliesTableTestHelper.addReply({
        id: payload.replyId,
        owner: payload.owner,
        commentId: commentIdHelper,
      });

      // Action and Assert
      await expect(
        replyRepository.verifyReplyOwner(payload)
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('verifyReplyByIdAndCommentId function', () => {
    // Arrange
    const replyRepository = new ReplyRepositoryPostgres(pool, {});

    beforeEach(async () => {
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        owner: userAId,
        commentId: commentIdHelper,
      });
    });

    it('should throw NotFoundError when reply was not found', async () => {
      const payload = {
        replyId: 'reply-invalid-id',
        owner: userAId,
        commentId: commentIdHelper,
      };

      const secondPayload = {
        replyId: 'reply-123',
        owner: userAId,
        commentId: 'comment-invalid-id',
      };

      // Action and Assert
      await expect(
        replyRepository.verifyReplyByIdAndCommentId(payload)
      ).rejects.toThrowError(new NotFoundError('reply tidak ditemukan'));
      await expect(
        replyRepository.verifyReplyByIdAndCommentId(secondPayload)
      ).rejects.toThrowError(new NotFoundError('reply tidak ditemukan'));
    });

    it('should not throw NotFoundError when reply was exist', async () => {
      const payload = {
        replyId: 'reply-123',
        owner: userAId,
        commentId: commentIdHelper,
      };

      // Action and Assert
      await expect(
        replyRepository.verifyReplyByIdAndCommentId(payload)
      ).resolves.not.toThrowError(NotFoundError);
    });
  });
});
