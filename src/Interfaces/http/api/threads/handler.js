const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetDetailThreadUseCase = require('../../../../Applications/use_case/GetDetailThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const { id: owner } = request.auth.credentials;
    const { title, body } = request.payload;
    const payload = {
      title,
      body,
      owner,
    };

    const addedThread = await addThreadUseCase.execute(payload);

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getThreadByIdHandler(request, h) {
    const getDetailThreadUseCase = this._container.getInstance(
      GetDetailThreadUseCase.name
    );
    const { threadId } = request.params;

    const thread = await getDetailThreadUseCase.execute({ threadId });

    const response = h.response({
      status: 'success',
      data: {
        thread,
      },
    });

    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;
