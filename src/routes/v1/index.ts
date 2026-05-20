import { Request, Response, Router } from "express";

import type {
  StdShippingRatesReqBody,
  StdShippingRatesResBody,
} from "../../types";
import { sendData } from "../../utils/apiSuccess";
import { asyncHandler } from "../../utils/asyncHandler";
import { StatusCodes } from "../../utils/constants";
import { validate } from "../../utils/validate";
import { stdShippingRatesReqBodySchema } from "../../validations";

const router = Router();

router.post(
  "/get-shipping-rates",
  validate(stdShippingRatesReqBodySchema),
  asyncHandler(
    async (
      req: Request<{}, {}, StdShippingRatesReqBody>,
      res: Response<StdShippingRatesResBody[]>,
    ) => {
      // Get shipping rates request body from request body
      const shippingRatesReqBody = req.body;

      // Validate shipping rates request body

      // Transform shipping rates request body to available providers

      // Transform responses from available providers to shipping rates response body

      // Return shipping rates response body
      sendData(res, undefined, StatusCodes.OK);
    },
  ),
);

export const v1Router = router;
