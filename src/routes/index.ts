import express from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { CategoryRoutes } from "../modules/category/category.route";
import { GearRoutes } from "../modules/gear/gear.route";
import { RentalRoutes } from "../modules/rental/rental.route";
import { PaymentRoutes } from "../modules/payment/payment.route";
import { ReviewRoutes } from "../modules/review/review.route";
import { ProviderRoutes } from "../modules/provider/provider.route";
import { AdminRoutes } from "../modules/admin/admin.route";

const router = express.Router();

const moduleRoutes = [
  { path: "/auth", route: AuthRoutes },
  { path: "/categories", route: CategoryRoutes },
  { path: "/gear", route: GearRoutes },
  { path: "/rentals", route: RentalRoutes },
  { path: "/payments", route: PaymentRoutes },
  { path: "/reviews", route: ReviewRoutes },
  { path: "/provider", route: ProviderRoutes },
  { path: "/admin", route: AdminRoutes },
];

moduleRoutes.forEach((r) => router.use(r.path, r.route));

export default router;
