const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentByIdHandler = this.deleteCommentByIdHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const addCommentUseCase = this._container.getInstance(
      AddCommentUseCase.name
    );

    const { id: owner } = request.auth.credentials;
    const { content } = request.payload;
    const { threadId } = request.params;

    const payload = {
      content,
      owner,
      threadId,
    };

    const addedComment = await addCommentUseCase.execute(payload);

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });

    response.code(201);

    return response;
  }

  async deleteCommentByIdHandler(request, h) {
    const deleteCommentUseCase = this._container.getInstance(
      DeleteCommentUseCase.name
    );

    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    await deleteCommentUseCase.execute({ commentId, owner, threadId });

    const response = h.response({
      status: 'success',
    });
    response.code(200);

    return response;
  }
}

module.exports = CommentsHandler;
