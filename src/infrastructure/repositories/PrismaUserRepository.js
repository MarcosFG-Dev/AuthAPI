const UserRepository = require("../../domain/repositories/UserRepository");

class PrismaUserRepository extends UserRepository {
  constructor({ prisma }) {
    super();
    this.prisma = prisma;
  }

  async create({ email, name, passwordHash }) {
    const user = await this.prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name || null,
        passwordHash,
      },
    });
    return this.toPublic(user);
  }

  async findByEmail(email) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async findById(id) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  toPublic(user) {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

module.exports = PrismaUserRepository;
