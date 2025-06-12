class DetailReply {
  constructor(payload) {
    this._verifyPayload(payload);
    const { id, content, username, date, isDeleted } = payload;

    this.id = id;
    this.content = isDeleted ? '**balasan telah dihapus**' : content;
    this.username = username;
    this.date = date;
  }

  _verifyPayload({ id, content, username, date, isDeleted }) {
    if (
      !id ||
      content === undefined ||
      !username ||
      !date ||
      isDeleted === undefined
    ) {
      throw new Error('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string' ||
      typeof content !== 'string' ||
      typeof username !== 'string' ||
      typeof date !== 'string' ||
      typeof isDeleted !== 'boolean'
    ) {
      throw new Error('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailReply;
