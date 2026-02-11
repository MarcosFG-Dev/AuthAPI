const { z } = require("zod");

const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(10)
    .max(128)
    .regex(/[A-Z]/, "Password must contain at least one uppercase character")
    .regex(/[a-z]/, "Password must contain at least one lowercase character")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  name: z.string().min(2).max(120).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

module.exports = {
  registerSchema,
  loginSchema,
};
