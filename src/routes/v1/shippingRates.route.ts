import { Router } from "express";

import { shippingRatesController } from "../../controllers/index.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../utils/validate.js";
import { stdShippingRatesReqBodySchema } from "../../validations/index.js";

const router = Router();

router.post(
  "/",
  validate(stdShippingRatesReqBodySchema),
  asyncHandler(shippingRatesController.getShippingRates),
);

export default router;
