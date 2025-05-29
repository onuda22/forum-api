const NewThread = require('../../Domains/thread/entities/NewThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const newThread = new NewThread(useCasePayload);
    return this._threadRepository.addThread({
      title: newThread.title,
      body: newThread.body,
      owner: newThread.owner,
    });
  }
}

module.exports = AddThreadUseCase;
