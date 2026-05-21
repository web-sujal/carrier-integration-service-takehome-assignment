import { Request, Response } from "express";

import { availableShippingProviders } from "..";
import { ShippingManager } from "../services/shipping/shippingManager";
import type { StdShippingRatesReqBody } from "../types";
import { sendData } from "../utils/apiSuccess";
import { StatusCodes } from "../utils/constants";

export const getShippingRates = async (
  req: Request<{}, {}, StdShippingRatesReqBody>,
  res: Response,
) => {
  const shippingManager = new ShippingManager(availableShippingProviders);
  const shippingRates = await shippingManager.getAllShippingRates(req.body);

  sendData(res, shippingRates, StatusCodes.OK);
  return;
};
