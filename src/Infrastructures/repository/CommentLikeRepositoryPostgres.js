const CommentLikeRepository = require("../../Domains/comment_likes/CommentLikeRepository");
class CommentLikeRepositoryPostgres extends CommentLikeRepository {
  constructor(pool) {
    super();
    this._pool = pool;
  }

  async saveCommentLike(commentLike) {
    const { userId, commentId } = commentLike;

    const query = {
      text: "INSERT INTO comment_likes VALUES($1, $2)",
      values: [userId, commentId],
    };

    await this._pool.query(query);
  }

  async deleteCommentLike(commentLike) {
    const { userId, commentId } = commentLike;

    const query = {
      text: "DELETE FROM comment_likes WHERE user_id = $1 AND comment_id = $2",
      values: [userId, commentId],
    };

    await this._pool.query(query);
  }

  async checkCommentLike(commentLike) {
    const { userId, commentId } = commentLike;

    const query = {
      text: "SELECT 1 FROM comment_likes WHERE user_id = $1 AND comment_id = $2",
      values: [userId, commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      return false;
    } else {
      return true;
    }
  }

  async countCommentLikeByCommentId(payload) {
    const { commentIds } = payload;

    const query = {
      text: `SELECT comment_id, COUNT(*) AS total
             FROM comment_likes
             WHERE comment_id = ANY($1::text[])
             GROUP BY comment_id
             ORDER BY comment_id ASC`,
      values: [commentIds],
    };

    const result = await this._pool.query(query);

    const likeMap = {};
    for (const id of commentIds) {
      likeMap[id] = 0;
    }

    for (const row of result.rows) {
      likeMap[row.comment_id] = Number(row.total);
    }

    return likeMap;
  }
}

module.exports = CommentLikeRepositoryPostgres;
