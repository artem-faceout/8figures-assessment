# Skill: Create API Endpoint

## When to use

When adding a new endpoint to the FastAPI server.

## Steps

1. Define Pydantic request/response models in `server/models/` — these are the source of truth
2. Wrap response in `ApiResponse[T]` envelope (see `skills/api-contract-patterns.md`)
3. Create or update router in `server/routers/`
4. Add router to `main.py` if new
5. Register custom exception handlers for domain errors
6. All endpoints under `/api/v1/` prefix
7. Use async def for all handlers
8. After server is running, regenerate client types: `cd client && npm run generate:types`
9. Document endpoint in `docs/api-contract.md`

## Template

```python
from typing import Annotated
from fastapi import APIRouter, Depends
from models.common import ApiResponse, Meta
from models.resource import ResourceResponse
from services.resource_service import ResourceService

router = APIRouter(prefix="/api/v1/resource", tags=["resource"])

ResourceServiceDep = Annotated[ResourceService, Depends(ResourceService)]

@router.get("/", response_model=ApiResponse[list[ResourceResponse]])
async def get_resources(service: ResourceServiceDep) -> ApiResponse[list[ResourceResponse]]:
    """Get all resources."""
    resources = await service.get_all()
    return ApiResponse(data=resources)

@router.get("/{resource_id}", response_model=ApiResponse[ResourceResponse])
async def get_resource(resource_id: str, service: ResourceServiceDep) -> ApiResponse[ResourceResponse]:
    """Get a single resource by ID."""
    resource = await service.get_by_id(resource_id)
    return ApiResponse(data=resource)
```

## Error Handling

Don't use raw `HTTPException`. Use custom domain exceptions + registered handlers:

```python
# In services — raise domain error
class ResourceNotFoundError(Exception):
    pass

# In main.py — register handler
@app.exception_handler(ResourceNotFoundError)
async def handle_resource_not_found(request, exc):
    return JSONResponse(
        status_code=404,
        content=ApiErrorResponse(
            error=ApiError(code="RESOURCE_NOT_FOUND", message=str(exc))
        ).model_dump(mode="json"),
    )
```

## Streaming Endpoints

Follow the SSE format from `skills/api-contract-patterns.md`:

```python
@router.post("/stream", response_class=StreamingResponse)
async def stream_resource(request: StreamRequest, service: ResourceServiceDep):
    async def generate():
        try:
            async for chunk in service.stream(request):
                yield f'data: {{"type": "chunk", "text": "{chunk}"}}\n\n'
            yield f'data: {{"type": "done", "meta": {{"timestamp": "{datetime.utcnow().isoformat()}Z"}}}}\n\n'
        except Exception as e:
            yield f'data: {{"type": "error", "error": {{"code": "INTERNAL_ERROR", "message": "{str(e)}"}}}}\n\n'

    return StreamingResponse(generate(), media_type="text/event-stream")
```

## Checklist

- [ ] Response wrapped in `ApiResponse[T]` envelope
- [ ] Error responses use `ApiErrorResponse` with defined error code
- [ ] Domain exceptions with registered handlers (not raw HTTPException)
- [ ] Async handler with `Depends()` injection
- [ ] Streaming uses typed SSE events with `type` discriminator
- [ ] Endpoint documented in `docs/api-contract.md`
- [ ] Client types regenerated after model changes
- [ ] CORS will work (check main.py middleware)
