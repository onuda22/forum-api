class DetailThread {
  constructor({ id, title, body, date, username, comments = [] }) {
    if (!id || !title || !body || !date || !username) {
      throw new Error('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (!Array.isArray(comments)) {
      throw new Error('DETAIL_THREAD.INVALID_COMMENTS_TYPE');
    }

    this.id = id;
    this.title = title;
    this.body = body;
    this.date = date;
    this.username = username;
    this.comments = comments;
  }
}

module.exports = DetailThread;
