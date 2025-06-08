const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const NewThread = require('../../../Domains/thread/entities/NewThread');
const AddedThread = require('../../../Domains/thread/entities/AddedThread');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('ThreadRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123' });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should add thread to database', async () => {
      // Arrange
      const thread = new NewThread({
        title: 'Thread Title',
        body: 'About thread test',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const threadRepository = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await threadRepository.addThread(thread);

      // Assert
      const existThread = await ThreadsTableTestHelper.findThreadById(
        'thread-123'
      );
      expect(existThread).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'Thread Title',
        body: 'About thread test',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      // Assert
      expect(addedThread).toStrictEqual(
        new AddedThread({
          id: 'thread-123',
          title: 'Thread Title',
          owner: 'user-123',
        })
      );
    });
  });

  describe('verifyThreadById function', () => {
    it('should return id of thread correctly', async () => {
      // Arrange
      const requestPayload = {
        threadId: 'thread-123',
      };

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await ThreadsTableTestHelper.addThread({
        id: requestPayload.id,
        owner: 'user-123',
      });

      // Action
      const threadId = await threadRepositoryPostgres.verifyThreadById(
        requestPayload
      );

      // Assert
      expect(threadId.id).toEqual(requestPayload.threadId);
    });
  });

  describe('getThreadById function', () => {
    it('should return thread correctly', async () => {
      // Arrange
      const requestPayload = {
        threadId: 'thread-123',
      };

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Add User, Thread and comments
      await ThreadsTableTestHelper.addThread({
        id: requestPayload.threadId,
        owner: 'user-123',
      });

      // Action
      const thread = await threadRepositoryPostgres.getThreadById(
        requestPayload
      );

      // Assert
      expect(thread).toBeDefined();
      expect(thread.id).toEqual(requestPayload.threadId);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return comments of thread correctly', async () => {
      // Arrange
      const requestPayload = {
        threadId: 'thread-123',
      };

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

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
      expect(comments).toBeDefined;
      expect(comments).toBeInstanceOf(Array);
      expect(comments).toHaveLength(1);
      expect(comments[0].id).toEqual('comment-123');
    });
  });
});
