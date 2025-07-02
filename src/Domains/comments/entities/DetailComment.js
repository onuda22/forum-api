class DetailComment {
  constructor({
    id,
    username,
    date,
    content,
    isDeleted,
    likeCount,
    replies = [],
  }) {
    if (
      !id ||
      !username ||
      !date ||
      content === undefined ||
      likeCount === undefined ||
      isDeleted === undefined
    ) {
      throw new Error("DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY");
    }

    if (!Array.isArray(replies)) {
      throw new Error("DETAIL_COMMENT.INVALID_REPLIES_TYPE");
    }

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = isDeleted ? "**komentar telah dihapus**" : content;
    this.likeCount = likeCount;
    this.replies = replies;
  }
}

module.exports = DetailComment;
