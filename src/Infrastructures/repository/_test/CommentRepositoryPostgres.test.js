const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const pool = require('../../database/postgres/pool');
const Comment = require('../../../Domains/comments/entities/Comment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123' });
    await ThreadsTableTestHelper.addThread({
      id: 'thread-123',
      owner: 'user-123',
    });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addComment function', () => {
    it('should add comment to database', async () => {
      // Arrange
      const newComment = new Comment({
        content: 'this is content',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      const fakeIdGenerator = () => '123';
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await commentRepository.addComment(newComment);

      // Assert
      const existComment = await CommentsTableTestHelper.findCommentsById(
        'comment-123'
      );
      expect(existComment).toHaveLength(1);
    });

    it('should return the AddedComment object correctly', async () => {
      // Arrange
      const newComment = new Comment({
        content: 'this is content',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      const fakeIdGenerator = () => '123';
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedComment = await commentRepository.addComment(newComment);

      // Assert
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: 'comment-123',
          content: 'this is content',
          owner: 'user-123',
        })
      );
    });
  });

  describe('findCommentById function', () => {
    it('should return the commentId and owner', async () => {
      // Arrange
      const payload = {
        commentId: 'comment-123',
      };

      await CommentsTableTestHelper.addComment({
        content: 'this is content',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      const commentRepository = new CommentRepositoryPostgres(pool, {});

      // Action
      const comment = await commentRepository.findCommentById(payload);

      // Assert
      expect(comment).toStrictEqual({
        id: 'comment-123',
        owner: 'user-123',
      });
    });
  });

  describe('deleteCommentById function', () => {
    it('should soft delete comment correctly, make is_delete to true', async () => {
      // Arrange
      const payload = {
        commentId: 'comment-123',
      };

      await CommentsTableTestHelper.addComment({
        content: 'this is comment content',
        owner: 'user-123',
        threadId: 'thread-123',
        isDeleted: false,
      });

      const commentRepository = new CommentRepositoryPostgres(pool, {});

      // Action
      commentRepository.deleteCommentById(payload);

      // Assert
      const comment = await CommentsTableTestHelper.findCommentsById(
        payload.commentId
      );

      expect(comment[0].is_deleted).toStrictEqual(true);
    });
  });

  describe('verifyCommentByThreadAndCommentId function', () => {
    const commentRepository = new CommentRepositoryPostgres(pool, {});

    it('should throw NotFoundError when comment was not found', async () => {
      // Arrange
      const payload = {
        threadId: 'thread-123',
        commentId: 'comment-123',
      };

      // Action and Assert
      await expect(
        commentRepository.verifyCommentByThreadAndCommentId(payload)
      ).rejects.toThrowError(new NotFoundError('comment tidak ditemukan'));
    });

    it('should not throw NotFoundError when comment was exist', async () => {
      // Arrange
      const payload = {
        threadId: 'thread-123',
        commentId: 'comment-123',
      };
      await CommentsTableTestHelper.addComment({
        id: payload.commentId,
        threadId: payload.threadId,
        owner: 'user-123',
      });

      // Action and Asser
      await expect(
        commentRepository.verifyCommentByThreadAndCommentId(payload)
      ).resolves.not.toThrow(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    const commentRepository = new CommentRepositoryPostgres(pool, {});

    it('should throw AuthorizationError when user is not the owner of comment', async () => {
      // Arrange
      const payload = {
        commentId: 'comment-123',
        owner: 'user-invalid',
      };

      await CommentsTableTestHelper.addComment({
        id: payload.commentId,
        owner: 'user-123',
        threadId: 'thread-123',
      });

      // Action and Assert
      await expect(
        commentRepository.verifyCommentOwner(payload)
      ).rejects.toThrowError(
        new AuthorizationError('akses ditolak user bukan pemilik comment')
      );
    });

    it('should not throw AuthorizationError when comment was found by userId and commentId', async () => {
      // Arrange
      const payload = {
        commentId: 'comment-123',
        owner: 'user-123',
      };

      await CommentsTableTestHelper.addComment({
        id: payload.commentId,
        owner: payload.owner,
        threadId: 'thread-123',
      });

      // Action and Assert
      await expect(
        commentRepository.verifyCommentOwner(payload)
      ).resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return comments of thread correctly', async () => {
      // Arrange
      const requestPayload = {
        threadId: 'threadX-123',
      };

      const threadRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Add User, Thread and comments
      await UsersTableTestHelper.addUser({
        id: 'user-test',
        username: 'testing',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-comment',
        username: 'testComment',
      });
      await ThreadsTableTestHelper.addThread({
        id: requestPayload.threadId,
        owner: 'user-test',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-comment',
        threadId: requestPayload.threadId,
      });

      // Action
      const comments = await threadRepositoryPostgres.getCommentsByThreadId(
        requestPayload
      );

      // Assert
      const getComment = await CommentsTableTestHelper.findCommentsById(
        'comment-123'
      );
      const getUser = await UsersTableTestHelper.findUsersById('user-comment');

      expect(comments).toBeDefined;
      expect(comments).toBeInstanceOf(Array);
      expect(comments).toHaveLength(1);
      expect(comments[0].id).toEqual(getComment[0].id);
      expect(comments[0].username).toEqual(getUser[0].username);
      expect(comments[0].date).toEqual(getComment[0].created_at);
      expect(comments[0].content).toEqual(getComment[0].content);
      expect(comments[0].isDeleted).toEqual(getComment[0].is_deleted);
    });
  });
});
