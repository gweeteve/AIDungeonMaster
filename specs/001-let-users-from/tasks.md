# Tasks: Game System Management Interface

**Input**: Design documents from `/specs/001-let-users-from/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory ✓
   → Extracted: TypeScript + Next.js + NestJS + LiteDB stack
2. Load optional design documents: ✓
   → data-model.md: GameSystem, Document, User entities → model tasks
   → contracts/: api.yaml + test files → contract test tasks
   → research.md: Tech stack decisions → setup tasks
3. Generate tasks by category: ✓
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests  
   → Core: models, services, controllers
   → Integration: DB, middleware, file handling
   → Polish: unit tests, performance, docs
4. Apply task rules: ✓
   → Different files = marked [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...) ✓
6. Generate dependency graph ✓
7. Create parallel execution examples ✓
8. Validate task completeness: ✓
   → All contracts have tests ✓
   → All entities have models ✓
   → All endpoints implemented ✓
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `backend/src/`, `frontend/src/`
- Frontend: Next.js 14 + Tailwind + Radix + shadcn/ui
- Backend: NestJS + TypeScript + LiteDB

## Phase 3.1: Setup
- [ ] T001 Create backend project structure with NestJS CLI and initialize package.json
- [ ] T002 Create frontend project structure with Next.js 14 and configure app router
- [ ] T003 [P] Configure TypeScript strict mode in backend/tsconfig.json
- [ ] T004 [P] Configure TypeScript strict mode in frontend/tsconfig.json
- [ ] T005 [P] Setup ESLint and Prettier for backend in backend/.eslintrc.js
- [ ] T006 [P] Setup ESLint and Prettier for frontend in frontend/.eslintrc.js
- [ ] T007 [P] Install backend dependencies: NestJS, LiteDB, class-validator, multer
- [ ] T008 [P] Install frontend dependencies: Tailwind, Radix UI, shadcn/ui, React Query
- [ ] T009 [P] Configure Tailwind CSS in frontend/tailwind.config.js
- [ ] T010 [P] Initialize shadcn/ui components in frontend/src/components/ui/

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests
- [ ] T011 [P] Contract test GET /api/game-systems in backend/tests/contract/game-systems-list.test.ts
- [ ] T012 [P] Contract test POST /api/game-systems in backend/tests/contract/game-systems-create.test.ts
- [ ] T013 [P] Contract test GET /api/game-systems/:id in backend/tests/contract/game-systems-get.test.ts
- [ ] T014 [P] Contract test PUT /api/game-systems/:id in backend/tests/contract/game-systems-update.test.ts
- [ ] T015 [P] Contract test DELETE /api/game-systems/:id in backend/tests/contract/game-systems-delete.test.ts
- [ ] T016 [P] Contract test POST /api/game-systems/:id/lock in backend/tests/contract/game-systems-lock.test.ts
- [ ] T017 [P] Contract test DELETE /api/game-systems/:id/lock in backend/tests/contract/game-systems-unlock.test.ts
- [ ] T018 [P] Contract test GET /api/game-systems/:id/documents in backend/tests/contract/documents-list.test.ts
- [ ] T019 [P] Contract test POST /api/game-systems/:id/documents in backend/tests/contract/documents-upload.test.ts
- [ ] T020 [P] Contract test GET /api/documents/:id in backend/tests/contract/documents-get.test.ts
- [ ] T021 [P] Contract test PUT /api/documents/:id in backend/tests/contract/documents-update.test.ts
- [ ] T022 [P] Contract test DELETE /api/documents/:id in backend/tests/contract/documents-delete.test.ts
- [ ] T023 [P] Contract test GET /api/documents/:id/download in backend/tests/contract/documents-download.test.ts

### Integration Tests
- [ ] T024 [P] Integration test complete game system creation workflow in backend/tests/integration/game-system-creation.test.ts
- [ ] T025 [P] Integration test document upload and validation workflow in backend/tests/integration/document-upload.test.ts
- [ ] T026 [P] Integration test system derivation workflow in backend/tests/integration/system-derivation.test.ts
- [ ] T027 [P] Integration test edit locking workflow in backend/tests/integration/edit-locking.test.ts
- [ ] T028 [P] Integration test JSON validation workflow in backend/tests/integration/json-validation.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Backend Models
- [ ] T029 [P] GameSystem entity in backend/src/models/game-system.model.ts
- [ ] T030 [P] Document entity in backend/src/models/document.model.ts
- [ ] T031 [P] User entity in backend/src/models/user.model.ts
- [ ] T032 [P] Create TypeScript interfaces in backend/src/types/index.ts

### Backend Services
- [ ] T033 GameSystemService CRUD operations in backend/src/services/game-system.service.ts
- [ ] T034 DocumentService CRUD operations in backend/src/services/document.service.ts
- [ ] T035 [P] ValidationService for JSON schemas in backend/src/services/validation.service.ts
- [ ] T036 [P] FileStorageService for document files in backend/src/services/file-storage.service.ts
- [ ] T037 [P] LockService for edit locking in backend/src/services/lock.service.ts

### Backend Controllers
- [ ] T038 GameSystemsController with all endpoints in backend/src/controllers/game-systems.controller.ts
- [ ] T039 DocumentsController with all endpoints in backend/src/controllers/documents.controller.ts

### Frontend Types and Services
- [ ] T040 [P] TypeScript types mirroring backend in frontend/src/types/game-system.types.ts
- [ ] T041 [P] TypeScript types for documents in frontend/src/types/document.types.ts
- [ ] T042 [P] API service for game systems in frontend/src/services/game-system.service.ts
- [ ] T043 [P] API service for documents in frontend/src/services/document.service.ts

### Frontend Core Components
- [ ] T044 [P] GameSystemCard component in frontend/src/components/game-systems/game-system-card.tsx
- [ ] T045 [P] GameSystemList component in frontend/src/components/game-systems/game-system-list.tsx
- [ ] T046 [P] CreateGameSystemForm component in frontend/src/components/game-systems/create-form.tsx
- [ ] T047 [P] EditGameSystemForm component in frontend/src/components/game-systems/edit-form.tsx
- [ ] T048 [P] DocumentCard component in frontend/src/components/documents/document-card.tsx
- [ ] T049 [P] DocumentUpload component in frontend/src/components/documents/document-upload.tsx
- [ ] T050 [P] DocumentList component in frontend/src/components/documents/document-list.tsx

### Frontend Pages
- [ ] T051 Game systems listing page in frontend/src/app/game-systems/page.tsx
- [ ] T052 Game system details page in frontend/src/app/game-systems/[id]/page.tsx
- [ ] T053 Create game system page in frontend/src/app/game-systems/create/page.tsx

## Phase 3.4: Integration

### Database Integration
- [ ] T054 Configure LiteDB connection in backend/src/database/database.module.ts
- [ ] T055 Create database repositories in backend/src/repositories/
- [ ] T056 Add database migrations and seed data in backend/src/database/migrations/

### File Handling Integration
- [ ] T057 Configure multer for file uploads in backend/src/middleware/upload.middleware.ts
- [ ] T058 Add file validation middleware in backend/src/middleware/file-validation.middleware.ts
- [ ] T059 Implement file serving controller in backend/src/controllers/files.controller.ts

### Frontend Integration
- [ ] T060 Setup React Query for API state management in frontend/src/providers/query-provider.tsx
- [ ] T061 Add authentication context in frontend/src/providers/auth-provider.tsx
- [ ] T062 Configure API client with interceptors in frontend/src/lib/api-client.ts

### Real-time Features
- [ ] T063 WebSocket service for lock notifications in backend/src/services/websocket.service.ts
- [ ] T064 Frontend WebSocket client in frontend/src/services/websocket.service.ts
- [ ] T065 Real-time lock status component in frontend/src/components/game-systems/lock-status.tsx

## Phase 3.5: Polish

### Unit Tests
- [ ] T066 [P] Unit tests for GameSystemService in backend/tests/unit/game-system.service.test.ts
- [ ] T067 [P] Unit tests for DocumentService in backend/tests/unit/document.service.test.ts
- [ ] T068 [P] Unit tests for ValidationService in backend/tests/unit/validation.service.test.ts
- [ ] T069 [P] Unit tests for React components in frontend/tests/components/
- [ ] T070 [P] Unit tests for frontend services in frontend/tests/services/

### End-to-End Tests
- [ ] T071 [P] E2E test for complete user journey in frontend/tests/e2e/game-system-management.spec.ts
- [ ] T072 [P] E2E test for document upload flow in frontend/tests/e2e/document-upload.spec.ts

### Performance and Documentation
- [ ] T073 [P] Performance optimization for large document uploads
- [ ] T074 [P] Add API documentation with Swagger UI
- [ ] T075 [P] Update README.md with setup and usage instructions
- [ ] T076 [P] Add error handling and user feedback components
- [ ] T077 Run quickstart.md validation scenarios

## Dependencies

### Sequential Dependencies
- Setup (T001-T010) → Tests (T011-T028) → Core Implementation (T029-T053) → Integration (T054-T065) → Polish (T066-T077)
- T029 (GameSystem model) → T033 (GameSystemService) → T038 (GameSystemsController)
- T030 (Document model) → T034 (DocumentService) → T039 (DocumentsController)
- T054 (Database connection) → T055 (Repositories) → T056 (Migrations)
- T040-T043 (Frontend types/services) → T044-T050 (Components) → T051-T053 (Pages)

### Must Complete Before
- All contract tests (T011-T023) MUST FAIL before starting core implementation
- All models (T029-T031) before services (T033-T037)
- All services before controllers (T038-T039)
- Backend API complete before frontend integration (T060-T062)

## Parallel Execution Examples

### Phase 3.2 Contract Tests (All Parallel)
```bash
# Launch all contract tests simultaneously:
Task T011: "Contract test GET /api/game-systems in backend/tests/contract/game-systems-list.test.ts"
Task T012: "Contract test POST /api/game-systems in backend/tests/contract/game-systems-create.test.ts"
Task T013: "Contract test GET /api/game-systems/:id in backend/tests/contract/game-systems-get.test.ts"
# ... continue with T014-T023
```

### Phase 3.3 Backend Models (All Parallel)
```bash
# Launch all model creation simultaneously:
Task T029: "GameSystem entity in backend/src/models/game-system.model.ts"
Task T030: "Document entity in backend/src/models/document.model.ts"
Task T031: "User entity in backend/src/models/user.model.ts"
Task T032: "Create TypeScript interfaces in backend/src/types/index.ts"
```

### Phase 3.3 Frontend Components (All Parallel)
```bash
# Launch all component creation simultaneously:
Task T044: "GameSystemCard component in frontend/src/components/game-systems/game-system-card.tsx"
Task T045: "GameSystemList component in frontend/src/components/game-systems/game-system-list.tsx"
Task T046: "CreateGameSystemForm component in frontend/src/components/game-systems/create-form.tsx"
# ... continue with T047-T050
```

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts (api.yaml)**:
   - 13 endpoints → 13 contract test tasks [P] (T011-T023)
   - Same endpoints → 2 controller implementation tasks (T038-T039)
   
2. **From Data Model**:
   - 3 entities → 3 model creation tasks [P] (T029-T031)
   - Services for each entity → 5 service tasks with dependencies
   
3. **From User Stories (quickstart.md)**:
   - 6 user journeys → 5 integration test tasks [P] (T024-T028)
   - Key workflows → E2E validation tasks (T071-T072)

4. **Ordering Applied**:
   - Setup → Tests → Models → Services → Controllers → Integration → Polish
   - TDD: All tests before any implementation
   - Dependencies: Models before services, services before controllers

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests (T011-T023 cover all api.yaml endpoints)
- [x] All entities have model tasks (T029-T031 for GameSystem, Document, User)
- [x] All tests come before implementation (Phase 3.2 before 3.3)
- [x] Parallel tasks truly independent (different files, no shared dependencies)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task

## Notes
- [P] tasks = different files, no dependencies, can run simultaneously
- Verify all tests fail before implementing (TDD approach)
- Commit after each completed task
- Frontend components use shadcn/ui for consistent styling
- Backend follows NestJS modular architecture patterns
- File uploads handled with multer middleware
- Real-time features use WebSocket for lock notifications