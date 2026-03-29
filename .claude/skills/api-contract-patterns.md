# Skill: API Contract Patterns

## When to use
When designing or implementing any API endpoint. Every endpoint must follow these patterns — no exceptions.

## Response Envelope

Every API response uses the same envelope. No raw arrays, no bare objects, no inconsistent shapes.

### Success Response
```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2026-03-29T10:00:00Z"
  }
}
```

- `data` — the actual payload. Can be an object or array depending on endpoint.
- `meta` — request metadata. Always includes `timestamp`. May include pagination info.

### Success Response (Paginated)
```json
{
  "data": [ ... ],
  "meta": {
    "timestamp": "2026-03-29T10:00:00Z",
    "pagination": {
      "total": 100,
      "page": 1,
      "per_page": 20,
      "total_pages": 5
    }
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "PORTFOLIO_NOT_FOUND",
    "message": "Portfolio with the given ID was not found.",
    "details": {}
  }
}
```

- `code` — machine-readable error code, UPPER_SNAKE_CASE. Stable across versions — clients can switch on this.
- `message` — human-readable description. Can change without breaking clients.
- `details` — optional additional context (validation errors, field names, etc.)

### Error Codes Convention
- `VALIDATION_ERROR` — request body failed Pydantic validation (422)
- `NOT_FOUND` — resource doesn't exist (404)
- `{RESOURCE}_NOT_FOUND` — specific resource not found, e.g. `PORTFOLIO_NOT_FOUND` (404)
- `INTERNAL_ERROR` — unexpected server error (500)
- `AI_SERVICE_ERROR` — Claude API failure (502)
- `AI_SERVICE_TIMEOUT` — Claude API timeout (504)
- `RATE_LIMITED` — too many requests (429)

## Streaming (SSE) Format

For streaming endpoints (AI chat), use Server-Sent Events:

### Text Chunk
```
data: {"type": "chunk", "text": "Here is"}\n\n
data: {"type": "chunk", "text": " a response"}\n\n
```

### Done
```
data: {"type": "done", "meta": {"timestamp": "2026-03-29T10:00:00Z"}}\n\n
```

### Error Mid-Stream
```
data: {"type": "error", "error": {"code": "AI_SERVICE_ERROR", "message": "Claude API connection lost"}}\n\n
```

Every SSE event is valid JSON with a `type` discriminator. Client can switch on `type` to handle each case.

## FastAPI Implementation

### Base Response Models (Pydantic)

```python
from datetime import datetime
from pydantic import BaseModel, Field


class Meta(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class PaginationMeta(Meta):
    pagination: PaginationInfo


class PaginationInfo(BaseModel):
    total: int
    page: int
    per_page: int
    total_pages: int


class ApiResponse[T](BaseModel):
    data: T
    meta: Meta = Field(default_factory=Meta)


class ApiError(BaseModel):
    code: str
    message: str
    details: dict = Field(default_factory=dict)


class ApiErrorResponse(BaseModel):
    error: ApiError
```

### Endpoint Pattern

```python
@router.get("/", response_model=ApiResponse[list[HoldingResponse]])
async def get_portfolio(service: PortfolioServiceDep) -> ApiResponse[list[HoldingResponse]]:
    holdings = await service.get_holdings()
    return ApiResponse(data=holdings)
```

### Error Handler Pattern

```python
@app.exception_handler(PortfolioNotFoundError)
async def portfolio_not_found(request: Request, exc: PortfolioNotFoundError):
    return JSONResponse(
        status_code=404,
        content=ApiErrorResponse(
            error=ApiError(code="PORTFOLIO_NOT_FOUND", message=str(exc))
        ).model_dump(mode="json"),
    )
```

## Angular Client Implementation

### API Service Base

```typescript
interface ApiResponse<T> {
  data: T;
  meta: { timestamp: string; pagination?: PaginationInfo };
}

interface ApiErrorResponse {
  error: { code: string; message: string; details: Record<string, unknown> };
}

interface PaginationInfo {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
```

### SSE Event Types

```typescript
type SSEEvent =
  | { type: 'chunk'; text: string }
  | { type: 'done'; meta: { timestamp: string } }
  | { type: 'error'; error: { code: string; message: string } };
```

### HTTP Interceptor for Error Handling

```typescript
export const apiErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const apiError = error.error as ApiErrorResponse;
      // Handle based on error.code
      return throwError(() => apiError.error);
    }),
  );
```

## Versioning Rules

- All endpoints prefixed with `/api/v1/`
- Version bump (`v2`) only when breaking the response shape for existing clients
- Adding new fields to a response is NOT a breaking change
- Removing or renaming fields IS a breaking change
- Adding new endpoints is NOT a breaking change

## Checklist for Every Endpoint

- [ ] Returns `ApiResponse<T>` envelope (not raw data)
- [ ] Error responses use `ApiErrorResponse` with a defined error code
- [ ] Streaming endpoints use typed SSE events with `type` discriminator
- [ ] Response model documented in `docs/api-contract.md`
- [ ] Pydantic model is the source of truth — TypeScript type auto-generated from OpenAPI
