import { Request, Response } from "express";

import type { StdShippingRatesReqBody } from "../types";
import { sendData } from "../utils/apiSuccess";
import { StatusCodes } from "../utils/constants";
import { shippingRatesService } from "../services";

export const getShippingRates = async (
  req: Request<{}, {}, StdShippingRatesReqBody>,
  res: Response,
) => {
  const {
    origin,
    destination,
    package_type,
    dimensions,
    weight,
    service_preference,
  } = req.body;

  const shippingRates = await shippingRatesService.getShippingRates(
    origin,
    destination,
    package_type,
    dimensions,
    weight,
    service_preference,
  );

  sendData(res, shippingRates, StatusCodes.OK);
  return;
};
