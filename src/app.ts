import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { config } from "./config/config.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { createUpsShippingRateStubRouter } from "./routes/stub/upsStub.route.js";
import { v1Router } from "./routes/v1/index.js";
import { sendData } from "./utils/apiSuccess.js";
import { StatusCodes } from "./utils/constants.js";

/**
 * Single Express application instance — wired with middleware + routes.
 * Never call `listen()` here; `src/index.ts` boots HTTP. Integration tests import `app` alone.
 */
export const app = express();

app.use(helmet());

app.use(morgan(config.server.nodeEnv === "production" ? "combined" : "dev"));

const allowAllOrigins =
  config.cors.origins.length === 0 ||
  (config.cors.origins.length === 1 && config.cors.origins[0] === "*");

const corsOrigin = allowAllOrigins
  ? true
  : config.cors.origins.map((o) => o.replace(/\/$/, ""));

app.use(
  cors({
    origin: corsOrigin,
    credentials: false,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.get("/health", (_req, res) => {
  return sendData(res, { status: "ok", message: "Server is running" });
});

app.get("/favicon.ico", (_req, res) => {
  return sendData(res, undefined, StatusCodes.NO_CONTENT);
});

app.use("/api/v1", v1Router);

app.use("/internal/stub/ups", createUpsShippingRateStubRouter());

app.use(errorHandler);
