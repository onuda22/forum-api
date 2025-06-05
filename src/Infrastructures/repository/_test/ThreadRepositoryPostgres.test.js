const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const NewThread = require('../../../Domains/thread/entities/NewThread');
const AddedThread = require('../../../Domains/thread/entities/AddedThread');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

describe('ThreadRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123' });
  });

  afterEach(async () => {
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
});
