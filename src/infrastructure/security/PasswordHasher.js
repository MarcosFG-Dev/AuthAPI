const bcrypt = require("bcryptjs");

class PasswordHasher {
  constructor(rounds = 12) {
    this.rounds = rounds;
  }

  async hash(plainText) {
    return bcrypt.hash(plainText, this.rounds);
  }

  async compare(plainText, hashed) {
    return bcrypt.compare(plainText, hashed);
  }
}

module.exports = PasswordHasher;
