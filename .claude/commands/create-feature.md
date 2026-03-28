# Command: Create Feature

## Workflow
Full feature creation from task description to working code.

### Input
Read the current task from `.claude/context/current-task.md`

### Steps

1. **Understand** — Read task description, acceptance criteria, and any referenced designs
2. **Plan** — Propose implementation approach:
   - Which components to create/modify
   - Which services needed
   - Which API endpoints needed
   - Data model changes
   - List edge cases
3. **Get approval** — Present plan, wait for confirmation before coding
4. **Implement frontend** — Follow `skills/create-angular-component.md`
5. **Implement backend** (if needed) — Follow `skills/create-api-endpoint.md`
6. **Self-review** — Run through `skills/code-review-checklist.md`
7. **Build verify** — `ng build` passes, no lint errors
8. **Commit** — Atomic commit with descriptive message

### Output
- Working feature accessible in the app
- Clean git commit
- Updated task status in context
