const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(newComment) {
    const { content, owner, threadId } = newComment;
    const id = `comment-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, owner, threadId, createdAt],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  /**
   * @returns NotFoundError when comment not found
   */
  async verifyCommentByThreadAndCommentId(payload) {
    const { threadId, commentId } = payload;

    const query = {
      text: 'SELECT 1 FROM comments WHERE id = $1 AND thread_id = $2',
      values: [commentId, threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }

  async verifyCommentOwner(payload) {
    const { commentId, owner } = payload;

    const query = {
      text: 'SELECT 1 FROM comments WHERE id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('akses ditolak user bukan pemilik comment');
    }
  }

  async findCommentById(payload) {
    const { commentId } = payload;
    const query = {
      text: 'SELECT id, owner FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async deleteCommentById(payload) {
    const { commentId } = payload;
    const query = {
      text: 'UPDATE comments SET is_deleted = $1 WHERE id = $2',
      values: [true, commentId],
    };

    await this._pool.query(query);
  }

  async getCommentsByThreadId(requestPayload) {
    const { threadId } = requestPayload;
    const query = {
      text: `SELECT c.id, 
                    u.username,
                    c.created_at as date,
                    c.content,
                    c.is_deleted as "isDeleted"
             FROM comments c
             INNER JOIN users u ON u.id = c.owner
             WHERE c.thread_id = $1
             ORDER BY date ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = CommentRepositoryPostgres;
