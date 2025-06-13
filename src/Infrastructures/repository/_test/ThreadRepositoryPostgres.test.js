const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const NewThread = require('../../../Domains/thread/entities/NewThread');
const AddedThread = require('../../../Domains/thread/entities/AddedThread');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('ThreadRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123' });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
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
    it('should not throw error if thread was found', async () => {
      // Arrange
      const requestPayload = {
        threadId: 'thread-123',
      };

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await ThreadsTableTestHelper.addThread({
        id: requestPayload.id,
        owner: 'user-123',
      });

      // Action and Assert
      await expect(
        threadRepositoryPostgres.verifyThreadById(requestPayload)
      ).resolves.not.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when thread was not found', async () => {
      // Arrange
      const requestPayload = {
        threadId: 'thread-123',
      };

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(
        threadRepositoryPostgres.verifyThreadById(requestPayload)
      ).rejects.toThrowError(NotFoundError);
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
        createdAt: '2025-06-13T16:17:44.117Z',
      });

      // Action
      const thread = await threadRepositoryPostgres.getThreadById(
        requestPayload
      );
      const getThreadHelper = await ThreadsTableTestHelper.findThreadById(
        requestPayload.threadId
      );
      const getUsername = await UsersTableTestHelper.findUsersById('user-123');

      // Assert
      expect(thread).toBeDefined();
      expect(thread.id).toEqual(getThreadHelper[0].id);
      expect(thread.title).toEqual(getThreadHelper[0].title);
      expect(thread.body).toEqual(getThreadHelper[0].body);
      expect(thread.date).toEqual(getThreadHelper[0].created_at);
      expect(thread.username).toEqual(getUsername[0].username);
    });
  });
});
