import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";

const getAllUsersDb = async () => {
  const result = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const updateUserStatusDb = async (userId: string, status: "ACTIVE" | "SUSPENDED") => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const result = await prisma.user.update({ where: { id: userId }, data: { status } });
  return result;
};

const getAllGearDb = async () => {
  const result = await prisma.gearItem.findMany({
    include: { category: true, provider: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const getAllRentalsDb = async () => {
  const result = await prisma.rentalOrder.findMany({
    include: {
      items: { include: { gearItem: true } },
      customer: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

export const AdminService = {
  getAllUsersDb,
  updateUserStatusDb,
  getAllGearDb,
  getAllRentalsDb,
};
