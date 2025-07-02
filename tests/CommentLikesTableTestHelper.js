/* istanbul ignore file */
const pool = require("../src/Infrastructures/database/postgres/pool");

const CommentLikesTableTestHelper = {
  async addLike({ userId = "user-123", commentId = "comment-123" }) {
    const query = {
      text: "INSERT INTO comment_likes VALUES($1, $2)",
      values: [userId, commentId],
    };

    await pool.query(query);
  },

  async verifyLike({ userId = "user-123", commentId = "comment-123" }) {
    const query = {
      text: "SELECT 1 FROM comment_likes WHERE user_id = $1 AND comment_id = $2",
      values: [userId, commentId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query("DELETE FROM comment_likes");
  },
};

module.exports = CommentLikesTableTestHelper;
