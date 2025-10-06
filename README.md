# AI Dungeon Master

AI Dungeon Master is a full-stack platform for managing tabletop RPG game systems, player documents, and shared worlds. The project is split into a NestJS backend API and a Next.js frontend application, backed by an eventual LiteDB datastore and rich validation utilities.

## 📁 Project Structure

```text
backend/   # NestJS services, controllers, and domain logic
frontend/  # Next.js 14 application with Tailwind CSS and Radix UI
specs/     # Feature specifications, research, and contracts
```

## 🚀 Features

- **Game Systems:** CRUD management, activation workflows, and usage statistics.
- **Documents:** Upload, version, and validate RPG system assets.
- **Worlds:** Launch and manage shared worlds linked to specific systems.
- **Validation & Locking:** Ajv-powered JSON schema validation and collaborative edit locking.

## ✅ Prerequisites

- Node.js 18 or later (tested with Node 22)
- npm 9+
- PowerShell (commands below use PowerShell syntax for Windows)

## 🔧 Local Setup

1. Clone the repository and `cd` into it.
2. Install all workspace dependencies in one go:

  ```powershell
  npm install
  ```

> Tip: keep backend and frontend running in separate terminals for hot reload (use the `-w` flag or the helper scripts below).

## 🛠️ Backend (NestJS)

Located in `backend/`.

### Environment

- Defaults to port **4000** (`PORT` env var overrides).
- Uses an in-memory LiteDB placeholder service for development.

If you need environment overrides, create a `.env` file in `backend/` and export variables before starting the server.

### Common Commands

```powershell
# Build once (outputs to dist/)
npm run build:backend

# Start in development mode with live reload
npm run start:dev

# Start compiled build
npm run start

# Run Jest tests
npm run test:backend

# Lint sources (fixes applied automatically)
npm run lint:backend

# Direct workspace command alternative
npm run start:dev -w backend
```

## 💻 Frontend (Next.js 14)

Located in `frontend/`.

### Development Server

```powershell
# Run the Next.js dev server on http://localhost:3000
npm run dev

# Create a production build
npm run build:frontend

# Start the production server
npm run start -w frontend

# Type-check with the workspace TypeScript config
npm run typecheck

# Lint with Next.js default rules
npm run lint:frontend

# Direct workspace command alternative
npm run dev -w frontend
```

The frontend expects the backend API to be reachable at `http://localhost:4000`. Update `.env.local` in `frontend/` if you want to point to a different API origin.

## 🧪 Testing

- **Backend:** Jest contract, integration, and unit suites live under `backend/tests/`. Run them with `npm run test:backend`.
- **Frontend:** Vitest for unit/integration and Playwright for e2e tests. Example commands:

  ```powershell
  npm run test:frontend          # Run Vitest in headless mode
  npm run test:frontend -- --ui  # Launch Vitest UI runner
  npm run test:e2e -w frontend   # Run Playwright e2e suite
  ```

## 🤝 Contributing

1. Create a feature branch from `main` or the relevant spec branch.
2. Implement changes with corresponding tests and documentation updates.
3. Run `npm run lint` and the test suite(s) for the layer you touched.
4. Submit a pull request describing the change and referencing the spec/task when possible.

## 🧭 Next Steps

- Replace the current mock LiteDB service with a real persistence layer.
- Expand API authentication and authorization once user flows are defined.
- Flesh out frontend e2e coverage for worlds and documents workflows.

Happy adventuring! 🧙‍♂️
