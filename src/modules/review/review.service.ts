import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";

const createReviewDb = async (
  customerId: string,
  payload: { gearItemId: string; rating: number; comment?: string }
) => {
  const hasReturnedRental = await prisma.rentalOrderItem.findFirst({
    where: {
      gearItemId: payload.gearItemId,
      rentalOrder: { customerId, status: "RETURNED" },
    },
  });

  if (!hasReturnedRental) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You can only review gear after returning a completed rental"
    );
  }

  const result = await prisma.review.create({
    data: { ...payload, customerId },
  });

  return result;
};

export const ReviewService = {
  createReviewDb,
};
