import { Request, Response } from "express";

import { shippingManager } from "../shippingRegistry";
import type { StdShippingRatesReqBody } from "../types";
import { sendData } from "../utils/apiSuccess";
import { StatusCodes } from "../utils/constants";

export const getShippingRates = async (
  req: Request<{}, {}, StdShippingRatesReqBody>,
  res: Response,
) => {
  const shippingRates = await shippingManager.getAllShippingRates(req.body);

  sendData(res, shippingRates, StatusCodes.OK);
  return;
};
