/* istanbul ignore file */

const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentTableTestHelper = {
  // id, content, owner, thread_id, created_at, is_delete
  // Make sure user must be exist
  // Make sure thread must be exist
  async addComment({
    id = 'comment-123',
    content = 'comment',
    owner = 'user-123',
    threadId = 'thread-123',
    createdAt = new Date().toISOString(),
    isDeleted = 'false',
  }) {
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, content, owner, threadId, createdAt, isDeleted],
    };

    await pool.query(query);
  },

  async findCommentsById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentTableTestHelper;
