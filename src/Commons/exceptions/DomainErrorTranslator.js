const InvariantError = require('./InvariantError');
const NotFoundError = require('./NotFoundError');
const AuthorizationError = require('./AuthorizationError');

const DomainErrorTranslator = {
  translate(error) {
    return DomainErrorTranslator._directories[error.message] || error;
  },
};

DomainErrorTranslator._directories = {
  'REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError(
    'tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'
  ),
  'REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError(
    'tidak dapat membuat user baru karena tipe data tidak sesuai'
  ),
  'REGISTER_USER.USERNAME_LIMIT_CHAR': new InvariantError(
    'tidak dapat membuat user baru karena karakter username melebihi batas limit'
  ),
  'REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER': new InvariantError(
    'tidak dapat membuat user baru karena username mengandung karakter terlarang'
  ),
  'USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError(
    'harus mengirimkan username dan password'
  ),
  'USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError(
    'username dan password harus string'
  ),
  'REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN':
    new InvariantError('harus mengirimkan token refresh'),
  'REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION':
    new InvariantError('refresh token harus string'),
  'DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN':
    new InvariantError('harus mengirimkan token refresh'),
  'DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION':
    new InvariantError('refresh token harus string'),
  'NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError(
    'tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada'
  ),
  'NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError(
    'tidak dapat membuat thread karena tipe data tidak sesuai'
  ),
  'COMMENT.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError(
    'tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada'
  ),
  'COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError(
    'tidak dapat membuat komentar baru karena tipe data tidak sesuai'
  ),
  'GET_DETAIL_THREAD_USE_CASE.THREAD_NOT_FOUND': new NotFoundError(
    'thread tidak ditemukan, threadId invalid'
  ),
  'REPLY.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError(
    'tidak dapat membuat object: properti yang dibutuhkan tidak ada'
  ),
  'REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError(
    'tidak dapat membuat object: tipe data tidak sesuai'
  ),
  'DELETE_REPLY_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError(
    'use_case: property yang dibutuhkan tidak ada'
  ),
  'DELETE_REPLY_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError(
    'use_case: tipe data tidak sesuai'
  ),
};

module.exports = DomainErrorTranslator;
