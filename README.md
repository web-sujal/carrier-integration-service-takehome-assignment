# Carrier Integration Service

Production-oriented TypeScript service that wraps the UPS Rating API behind a normalized internal contract.

Designed for extensibility so additional carriers (FedEx, USPS, DHL) and operations (tracking, labels, address validation) can be added without rewriting core orchestration logic.

---

## Features

- UPS rate shopping integration (stubbed)
- OAuth token acquisition + reuse + refresh
- Strong TypeScript typing
- Zod runtime validation
- Structured error handling
- Extensible provider architecture
- Integration-testable design

---

## Architecture

```txt id="’wini244"
Client
→ Express Route
→ Validation Middleware
→ ShippingManager
→ ShippingProvider(s)
→ Carrier API / Stub
```

### Key Design Decisions

- `BaseShippingProvider` implements the shared request lifecycle.
- Carrier-specific providers only handle mapping/auth specifics.
- `ShippingManager` orchestrates providers without knowing implementation details.
- `UpsAuthManager` isolates OAuth lifecycle handling.
- Internal normalized contracts prevent leaking UPS-specific payloads to callers.

---

## Run Locally

```bash id="’wini245"
pnpm install
cp .env.example .env
pnpm dev
```

---

## Example Request

```bash id="’wini246"
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
    "weight": 5
  }'
```

---

## Example Response

```json id="’wini247"
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
- timeout + error handling
- malformed provider responses

using stubbed UPS responses without requiring live UPS credentials.

---

## Future Improvements

- retries/backoff
- structured logging
- metrics/tracing
- additional carrier integrations
- Docker support
