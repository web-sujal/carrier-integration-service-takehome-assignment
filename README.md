# Carrier Integration Service

Production-oriented TypeScript service that wraps carrier APIs behind a normalized internal contract.

Currently only UPS rating flow is implemented (stubbed), but architecture was kept extensible so more providers like FedEx / USPS / DHL can be added later without rewriting the orchestration logic.

---

## Features

- UPS shipping rate integration (stubbed internally)
- OAuth token handling (fetch, cache, refresh on expiry)
- Retry handling with exponential backoff + jitter
- Retry support for timeout / transient `5xx` / `429`
- Zod runtime validation
- Structured API error responses
- Strong TypeScript types
- Integration-test friendly architecture

---

## Flow

```txt
Client
  → Express Route
    → Validation Middleware
      → ShippingManager
        → ShippingProvider(s)
          → Carrier API / Stub
```

---

## Some Design Decisions

- `BaseShippingProvider` owns the shared request lifecycle and transport resilience logic.
- Carrier providers only implement provider-specific logic like payload mapping, headers, auth handling etc.
- `ShippingManager` works on abstractions instead of concrete providers.
- `UpsAuthManager` handles token lifecycle separately from transport logic.
- External UPS payloads are transformed into normalized internal contracts before returning to clients.

---

## Run Locally

```bash
pnpm install
cp .env.example .env
pnpm dev
```

---

## Example Request

```bash
curl -X POST http://localhost:8080/api/v1/shipping-rates \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "123 Main St, Baltimore MD",
    "destination": "456 Elm St, Atlanta GA",
    "package_type": "box",
    "dimensions": {
      "length": 10,
      "width": 8,
      "height": 6
    },
    "weight": 5,
    "service_preference": "standard"
  }'
```

---

## Example Response

```json
{
  "data": [
    {
      "rate": 42.99,
      "provider_name": "UPS",
      "currency": "USD",
      "estimated_delivery_days": 3
    }
  ]
}
```

---

## Testing

Integration tests run against the local Express app. Happy-path shipping quotes use the in-app UPS rating stub (`/internal/stub/ups`); token behavior is covered in `upsAuth.integration.test.ts` with spies and, for the HTTP 401 path, mocked `axios.post` rating responses (no live UPS OAuth calls).

Current test coverage includes:

- request validation (invalid payloads)
- successful quotes and normalized fields from the stubbed rating response
- errors when no shipping providers are configured
- OAuth token caching, refresh after HTTP 401, and refresh when the cached token is past the expiry skew

Run tests:

```bash
pnpm test
```

---

## Project Structure

```txt
src/
├── controllers/
├── routes/
├── services/
│   └── shipping/
│       ├── providers/
│       ├── shippingFactory.ts
│       └── shippingManager.ts
├── utils/
├── validations/
└── types/

tests/
├── integration/
├── unit/
```

---

## Future Improvements

- add more carrier providers
- structured logging
- metrics/tracing
- Docker support
