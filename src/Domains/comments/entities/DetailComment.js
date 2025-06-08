class DetailComment {
  constructor({ id, username, date, content, isDeleted }) {
    if (
      !id ||
      !username ||
      !date ||
      content === undefined ||
      isDeleted === undefined
    ) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = isDeleted ? '**komentar telah dihapus**' : content;
  }
}

module.exports = DetailComment;
