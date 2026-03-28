# Skill: Create API Endpoint

## When to use

When adding a new endpoint to the FastAPI server.

## Steps

1. Define Pydantic request/response models in `server/models/`
1. Create or update router in `server/routers/`
1. Add router to `main.py` if new
1. All endpoints under `/api/v1/` prefix
1. Use async def for all handlers
1. Add proper HTTP status codes and error responses

## Template

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/resource", tags=["resource"])

class ResourceResponse(BaseModel):
    id: str
    name: str
    # ...

@router.get("/", response_model=list[ResourceResponse])
async def get_resources():
    """Get all resources."""
    # Implementation
    pass
```

## Checklist

- [ ] Pydantic model for response (and request if POST/PUT)
- [ ] Async handler
- [ ] Proper error handling with HTTPException
- [ ] CORS will work (check main.py middleware)
