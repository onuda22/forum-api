const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const pool = require('../../database/postgres/pool');
const Comment = require('../../../Domains/comments/entities/Comment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

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

      await CommentTableTestHelper.addComment({
        content: 'this is comment content',
        owner: 'user-123',
        threadId: 'thread-123',
        isDeleted: false,
      });

      const commentRepository = new CommentRepositoryPostgres(pool, {});

      // Action
      commentRepository.deleteCommentById(payload);

      // Assert
      const comment = await CommentTableTestHelper.findCommentsById(
        payload.commentId
      );

      expect(comment[0].is_deleted).toStrictEqual(true);
    });
  });
});
