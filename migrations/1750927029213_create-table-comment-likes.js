/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable("comment_likes", {
    user_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    comment_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
  });

  pgm.addConstraint("comment_likes", "comment_likes.user_id_fkey", {
    foreignKeys: {
      columns: "user_id",
      references: "users(id)",
    },
  });

  pgm.addConstraint("comment_likes", "comment_likes.comment_id_fkey", {
    foreignKeys: {
      columns: "comment_id",
      references: "comments(id)",
    },
  });

  // Make the row is unik so that will not double like in the same comment
  // from the same user
  pgm.addConstraint("comment_likes", "unique_user_comment", {
    primaryKey: ["user_id", "comment_id"],
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("comment_likes");
};
