# Carrier Integration Service

Production-oriented TypeScript service that wraps carrier APIs behind a normalized internal contract.

Currently implements UPS Rating integration (stubbed) while being designed for future extensibility across additional carriers (FedEx, USPS, DHL) without modifying orchestration logic.

---

## Features

- UPS rate shopping integration (stubbed)
- OAuth token acquisition, reuse, and refresh
- Retry handling with exponential backoff + jitter
- Rate-limit (`429`) and transient `5xx` retry support
- Strong TypeScript typing
- Zod runtime validation
- Structured API error handling
- Extensible provider-based architecture
- Integration-testable design

---

## Architecture

```txt
Client
→ Express Route
→ Validation Middleware
→ ShippingManager
→ ShippingProvider(s)
→ Carrier API / Stub
```

### Key Design Decisions

- `BaseShippingProvider` owns the shared request lifecycle and transport resilience.
- Carrier providers only implement provider-specific mapping/auth logic.
- `ShippingManager` orchestrates providers without knowing implementation details.
- `UpsAuthManager` isolates OAuth lifecycle handling.
- Internal normalized contracts prevent leaking UPS-specific payloads to callers.
- Retry/backoff logic is centralized to avoid duplication across providers.

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

Integration tests validate:

- request payload construction
- response normalization
- OAuth token reuse/refresh
- timeout + retry behavior
- structured error handling
- malformed provider responses

All tests use stubbed UPS responses and do not require live UPS credentials.

---

## Future Improvements

- additional carrier integrations
- structured logging
- metrics/tracing
- Docker support
