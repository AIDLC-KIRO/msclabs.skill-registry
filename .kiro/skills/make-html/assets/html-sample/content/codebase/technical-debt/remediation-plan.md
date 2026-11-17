# Remediation Plan

## Priority 1: Critical Security Fixes (High)

### 1.1 Remove TLS Certificate Bypass
- **File**: `server/event-bridge.js`
- **Action**: Remove `process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"`
- **Alternative**: Configure proper CA certificate for TrakCare server, or use `https.Agent` with specific CA
- **Risk**: TrakCare connection may fail if using self-signed cert — coordinate with infrastructure team

### 1.2 Restrict CORS Origin
- **File**: `server/middlewares/index.js`
- **Action**: Replace `origin: "*"` with specific frontend domain(s)
- **Example**: `origin: [process.env.REACT_APP_FRONTEND_URL]`

### 1.3 Upgrade axios
- **File**: `package.json`
- **Action**: Upgrade `axios` from `0.19.2` to `1.7.x`
- **Breaking Changes**: Update any `.data` access patterns, FormData usage

### 1.4 Fix Trust Proxy
- **File**: `server/event-bridge.js`
- **Action**: Replace `return true` with specific trusted proxy IPs
- **Impact**: Rate limiting will correctly identify client IPs

## Priority 2: Frontend Modernization (High)

### 2.1 Migrate from CRA to Vite
- **Action**: Replace `react-scripts` with Vite build system
- **Steps**:
  1. Install `vite` and `@vitejs/plugin-react`
  2. Create `vite.config.js` with proxy configuration
  3. Move `public/index.html` to root
  4. Update `package.json` scripts
  5. Remove `react-scripts` dependency
- **Benefit**: Resolves Webpack 4 debt, faster builds, HMR

### 2.2 Upgrade React 16 → 18
- **Steps**:
  1. Upgrade `react` and `react-dom` to 18.x
  2. Replace `ReactDOM.render` with `createRoot`
  3. Remove Enzyme, replace with React Testing Library
  4. Migrate class components to function components with hooks (optional but recommended)
- **Prerequisite**: Complete 2.1 first (CRA 3 doesn't support React 18)

### 2.3 Migrate Material UI 4 → MUI 5
- **Steps**:
  1. Install `@mui/material`, `@emotion/react`, `@emotion/styled`
  2. Run MUI codemods: `npx @mui/codemod v5.0.0/preset-safe src/`
  3. Update import paths from `@material-ui/*` to `@mui/*`
  4. Remove old `@material-ui/*` packages

## Priority 3: Dependency Updates (Medium)

### 3.1 Update react-router-dom 5 → 6
- **Breaking Changes**: Replace `<Switch>` with `<Routes>`, `component` prop with `element`
- **Scope**: `src/routes/index.js` render method, all Route declarations

### 3.2 Replace unmaintained packages
- `react-autosuggest` → `@mui/material Autocomplete`
- `bulma-extensions` → Custom CSS or remove unused extensions
- `Enzyme` → `@testing-library/react` (already partially present)

### 3.3 Update remaining dependencies
- `antd 4→5`, `react-calendar 2→5`, `node-schedule 1→2`
- Each has breaking changes; update individually with testing

## Priority 4: Architectural Improvements (Low)

### 4.1 Extract State Management
- Move from god component to React Context or lightweight state management (Zustand)
- Separate concerns: data fetching, WebSocket, alarm logic into custom hooks

### 4.2 Remove Dead Code
- Delete `server/modules.old/` directory
- Delete all `.old` files
- Remove commented-out code blocks

### 4.3 Add Test Coverage
- Add unit tests for backend modules (especially patientAppointment.js business logic)
- Add integration tests for API endpoints
- Add component tests for Dashboard alarm/blink logic

### 4.4 Extract SQL Layer
- Move SQL queries to separate files or use a query builder
- Centralize status mapping CASE statement
- Add database migration tooling (e.g., knex migrations)

## Related Documentation

- [Summary](./summary.md)
- [Outdated Components](./outdated-components.md)
- [Maintenance Burden](./maintenance-burden.md)
- [Technical Debt Report](../technical-debt-report.md)
