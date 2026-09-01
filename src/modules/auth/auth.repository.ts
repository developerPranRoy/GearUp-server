import prisma from "../../shared/prisma";

const USER_PUBLIC_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
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

const create = (data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "CUSTOMER" | "PROVIDER";
}) => prisma.user.create({ data, select: USER_PUBLIC_SELECT });

const update = (id: string, data: { name?: string; phone?: string }) =>
  prisma.user.update({ where: { id }, data, select: USER_PUBLIC_SELECT });

export const AuthRepository = {
  findByEmail,
  findById,
  findByIdWithPassword,
  create,
  update,
};
