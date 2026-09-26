import prisma from "../../shared/prisma";

const USER_PUBLIC_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  avatarUrl: true,
  role: true,
  status: true,
  createdAt: true,
} as const;

const findByEmail = (email: string) =>
  prisma.user.findUnique({ where: { email } });

const findById = (id: string) =>
  prisma.user.findUnique({ where: { id }, select: USER_PUBLIC_SELECT });

const findByIdWithPassword = (id: string) =>
  prisma.user.findUnique({ where: { id } });

const findByGoogleId = (googleId: string) =>
  prisma.user.findUnique({ where: { googleId }, select: USER_PUBLIC_SELECT });

const create = (data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "CUSTOMER" | "PROVIDER";
}) => prisma.user.create({ data, select: USER_PUBLIC_SELECT });

/**
 * Find-or-create a user by googleId.
 * If a user exists with the same email but no googleId, we link the accounts.
 */
const upsertGoogleUser = async (data: {
  googleId: string;
  name: string;
  email: string;
}) => {
  // Check if a user already exists with this googleId
  const byGoogleId = await prisma.user.findUnique({
    where: { googleId: data.googleId },
  });
  if (byGoogleId) return byGoogleId;

  // Check if a user exists with the same email (credential account) — link it
  const byEmail = await prisma.user.findUnique({ where: { email: data.email } });
  if (byEmail) {
    return prisma.user.update({
      where: { id: byEmail.id },
      data: { googleId: data.googleId },
    });
  }

  // New user — create with CUSTOMER role by default
  return prisma.user.create({
    data: {
      googleId: data.googleId,
      name: data.name,
      email: data.email,
      role: "CUSTOMER",
    },
  });
};

const update = (id: string, data: { name?: string; phone?: string }) =>
  prisma.user.update({ where: { id }, data, select: USER_PUBLIC_SELECT });

const updateAvatar = (id: string, avatarUrl: string) =>
  prisma.user.update({ where: { id }, data: { avatarUrl }, select: USER_PUBLIC_SELECT });

export const AuthRepository = {
  findByEmail,
  findById,
  findByIdWithPassword,
  findByGoogleId,
  create,
  upsertGoogleUser,
  update,
  updateAvatar,
};
