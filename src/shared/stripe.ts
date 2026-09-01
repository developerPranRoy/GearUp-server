import Stripe from "stripe";
import config from "../config";

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: "2026-06-24.dahlia",
  typescript: true,
});

export default stripe;
