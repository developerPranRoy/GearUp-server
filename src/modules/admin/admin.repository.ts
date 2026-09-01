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

const findAllUsers = (skip: number, take: number) =>
  prisma.user.findMany({
    select: USER_PUBLIC_SELECT,
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });

const countUsers = () => prisma.user.count();

const findUserById = (id: string) =>
  prisma.user.findUnique({ where: { id } });

const updateUserStatus = (id: string, status: "ACTIVE" | "SUSPENDED") =>
  prisma.user.update({ where: { id }, data: { status }, select: USER_PUBLIC_SELECT });

const findAllGear = (skip: number, take: number) =>
  prisma.gearItem.findMany({
    include: { category: true, provider: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });

const countGear = () => prisma.gearItem.count();

const findAllRentals = (skip: number, take: number) =>
  prisma.rentalOrder.findMany({
    include: {
      items: { include: { gearItem: true } },
      customer: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });

const countRentals = () => prisma.rentalOrder.count();

export const AdminRepository = {
  findAllUsers,
  countUsers,
  findUserById,
  updateUserStatus,
  findAllGear,
  countGear,
  findAllRentals,
  countRentals,
};
