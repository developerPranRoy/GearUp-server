import prisma from "../../shared/prisma";

const findReturnedRental = (customerId: string, gearItemId: string) =>
  prisma.rentalOrderItem.findFirst({
    where: {
      gearItemId,
      rentalOrder: { customerId, status: "RETURNED" },
    },
  });

const findExisting = (customerId: string, gearItemId: string) =>
  prisma.review.findFirst({ where: { customerId, gearItemId } });

const create = (data: {
  customerId: string;
  gearItemId: string;
  rating: number;
  comment?: string;
}) => prisma.review.create({ data });

export const ReviewRepository = { findReturnedRental, findExisting, create };
