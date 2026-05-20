import axios, { type AxiosError } from "axios";
import { ZodError } from "zod";

import { ApiError } from "../../../../utils/apiError";
import { StatusCodes } from "../../../../utils/constants";

/**
 * Normalize UPS provider failures (Zod / Axios carrier payloads / unknown throws) into an {@link ApiError}.
 */
export function normalizeUpsProviderError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof ZodError) {
    return new ApiError(StatusCodes.BAD_REQUEST, "Invalid request payload", {
      code: "VALIDATION_ERROR",
      details: error.flatten().fieldErrors,
    });
  }

  if (axios.isAxiosError(error)) {
    return normalizeUpsAxiosCarrierError(error);
  }

  if (error instanceof Error) {
    return new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message || "Unexpected error",
      {
        code: "UPS_UNEXPECTED_ERROR",
      },
    );
  }

  return new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Unexpected error", {
    code: "UPS_UNKNOWN_ERROR",
    details: error,
  });
}

/** UPS OAuth / REST-style error bodies (HTTP 400, 401, 403, 429, …). */
interface UpsCarrierErrorBody {
  response?: {
    errors?: Array<{ code?: string; message?: string }>;
  };
}

function extractUpsCarrierErrors(
  body: unknown,
): Array<{ code?: string; message?: string }> | undefined {
  if (body === null || typeof body !== "object") {
    return undefined;
  }
  const errs = (body as UpsCarrierErrorBody).response?.errors;
  if (!Array.isArray(errs) || errs.length === 0) {
    return undefined;
  }
  return errs;
}

/** Keep carrier HTTP semantics when Axios included a numeric status from UPS. */
function httpStatusFromAxios(status: unknown): number {
  return typeof status === "number" && status >= 400 && status <= 599
    ? status
    : StatusCodes.BAD_GATEWAY;
}

function normalizeUpsAxiosCarrierError(err: AxiosError): ApiError {
  const httpStatus = httpStatusFromAxios(err.response?.status);

  const data = err.response?.data;
  const entries = extractUpsCarrierErrors(data);

  if (entries && entries.length > 0) {
    const message =
      entries
        .map((e) => (typeof e.message === "string" ? e.message.trim() : ""))
        .filter(Boolean)
        .join("; ") ||
      err.message ||
      "UPS API error";

    const firstCode = entries[0]?.code;
    const code =
      typeof firstCode === "string" && firstCode.trim().length > 0
        ? firstCode.trim()
        : "UPS_API_ERROR";

    return new ApiError(httpStatus, message, {
      code,
      details: {
        response: {
          errors: entries,
        },
      },
    });
  }

  const fallbackMessage =
    typeof data === "string" && data.trim().length > 0
      ? data.trim().slice(0, 512)
      : err.response?.statusText?.trim() ||
        err.message ||
        "UPS request failed";

  return new ApiError(httpStatus, fallbackMessage, {
    code: "UPS_HTTP_ERROR",
    details:
      err.response !== undefined
        ? { httpStatus: err.response.status, data: err.response.data }
        : { message: err.message },
  });
}
