import bcrypt from "bcryptjs";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/errors.js";
import { signAuthToken } from "../../lib/jwt.js";

export async function authenticateAdmin(email: string, password: string) {
  const admin = await prisma.adminUser.findUnique({
    where: {
      email
    }
  });

  if (!admin) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
  }

  const isValid = await bcrypt.compare(password, admin.passwordHash);

  if (!isValid) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
  }

  const token = signAuthToken({
    sub: admin.id,
    email: admin.email,
    role: admin.role
  });

  return {
    admin,
    token
  };
}
