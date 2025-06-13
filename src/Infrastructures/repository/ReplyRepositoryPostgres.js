const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../Domains/reply/entities/AddedReply');
const ReplyRepository = require('../../Domains/reply/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(newReply) {
    const { content, owner, commentId } = newReply;
    const id = `reply-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, owner, commentId, createdAt],
    };

    const result = await this._pool.query(query);

    return new AddedReply({ ...result.rows[0] });
  }

  async softDeleteReplyById(payload) {
    const { replyId } = payload;
    const isDeleted = true;
    const query = {
      text: 'UPDATE replies SET is_deleted = $1 WHERE id = $2',
      values: [isDeleted, replyId],
    };

    await this._pool.query(query);
  }

  async verifyReplyOwner(payload) {
    const { replyId, owner } = payload;
    const query = {
      text: 'SELECT 1 FROM replies WHERE id = $1 AND owner = $2',
      values: [replyId, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('akses ditolak user bukan pemilik reply');
    }
  }

  async verifyReplyByIdAndCommentId(payload) {
    const { replyId, commentId } = payload;
    const query = {
      text: 'SELECT 1 FROM replies WHERE id = $1 AND comment_id = $2',
      values: [replyId, commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('reply tidak ditemukan');
    }
  }

  async getRepliesByCommentId(requestPayload) {
    const { commentIds } = requestPayload;
    const query = {
      text: `SELECT r.id,
                    u.username,
                    r.created_at AS date,
                    r.content,
                    r.comment_id AS "commentId",
                    r.is_deleted AS "isDeleted"
             FROM replies r
             INNER JOIN users u ON u.id = r.owner
             WHERE r.comment_id = ANY($1::text[])
             ORDER BY date ASC`,
      values: [commentIds],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = ReplyRepositoryPostgres;
