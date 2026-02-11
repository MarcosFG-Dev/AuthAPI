const AppError = require("../../../shared/errors/AppError");

class GetCurrentUserUseCase {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute({ userId }) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", {
        statusCode: 404,
        code: "USER_NOT_FOUND",
      });
    }
    return this.userRepository.toPublic(user);
  }
}

module.exports = GetCurrentUserUseCase;
