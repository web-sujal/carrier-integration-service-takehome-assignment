import { describe, it } from "vitest";

describe("Shipping Retry Integration Test", () => {
  it.todo("Retries transient errors (500, 502, 503, 504)");
  it.todo("Retries rate-limited errors (429)");
  it.todo("Retries timeout errors (ECONNABORTED)");
  it.todo("Honors Retry-After header");
});
