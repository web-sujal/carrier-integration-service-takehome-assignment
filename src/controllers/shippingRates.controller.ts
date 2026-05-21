import { Request, Response } from "express";

import { shippingManager } from "../shippingRegistry.js";
import type { StdShippingRatesReqBody } from "../types/index.js";
import { sendData } from "../utils/apiSuccess.js";
import { StatusCodes } from "../utils/constants.js";

export const getShippingRates = async (
  req: Request<{}, {}, StdShippingRatesReqBody>,
  res: Response,
) => {
  const shippingRates = await shippingManager.getAllShippingRates(req.body);

  sendData(res, shippingRates, StatusCodes.OK);
  return;
};
