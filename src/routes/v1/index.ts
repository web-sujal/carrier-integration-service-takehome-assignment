import { Router } from "express";
import shippingRatesRouter from './shippingRates.route';

export const v1Router = Router();

v1Router.use('/shipping-rates', shippingRatesRouter);
