const CommentRepository = require('../CommentRepository');

describe('A CommentRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const commentRepository = new CommentRepository();

    // Action and Assert
    await expect(commentRepository.addComment('')).rejects.toThrowError(
      'COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
    await expect(
      commentRepository.verifyCommentByThreadAndCommentId('')
    ).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentRepository.verifyCommentOwner('')).rejects.toThrowError(
      'COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
    await expect(commentRepository.findCommentById('')).rejects.toThrowError(
      'COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
    await expect(commentRepository.deleteCommentById('')).rejects.toThrowError(
      'COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
    await expect(
      commentRepository.getCommentsByThreadId('')
    ).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
