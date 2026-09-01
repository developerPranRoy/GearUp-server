import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { ReviewRepository } from "./review.repository";

const createReview = async (
  customerId: string,
  payload: { gearItemId: string; rating: number; comment?: string }
) => {
  const hasReturnedRental = await ReviewRepository.findReturnedRental(
    customerId,
    payload.gearItemId
  );
  if (!hasReturnedRental) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You can only review gear after returning a completed rental"
    );
  }

  const existing = await ReviewRepository.findExisting(customerId, payload.gearItemId);
  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, "You have already reviewed this item");
  }

  return ReviewRepository.create({ ...payload, customerId });
};

export const ReviewService = { createReview };
