# Outdated Components

## High Severity - EOL/Deprecated Runtimes and Frameworks

### React 16.13.1
- **Current**: 16.13.1 (released March 2020)
- **Latest Stable**: 19.x (2024)
- **EOL Status**: React 16 receives no security patches
- **Impact**: Missing concurrent mode, automatic batching, server components, hooks patterns, new JSX transform
- **Migration Path**: React 16 → 17 (no breaking changes) → 18 (createRoot, StrictMode changes) → 19

### react-scripts 3.4.1 (Create React App)
- **Current**: 3.4.1
- **Status**: Create React App is officially deprecated by React team
- **Impact**: Locks project to Webpack 4, Babel 7.9, ESLint 6, Jest 24
- **Migration Path**: Eject and migrate to Vite, or adopt Next.js/Remix

### Webpack 4.42.0
- **Current**: 4.42.0 (March 2020)
- **Latest Stable**: 5.x (since October 2020)
- **Impact**: Missing module federation, asset modules, persistent caching improvements, tree-shaking enhancements
- **Note**: Directly tied to react-scripts; migrating react-scripts resolves this

### Material UI 4.x (@material-ui/core, @material-ui/icons, @material-ui/lab)
- **Current**: 4.9.9 / 4.9.1 / 4.0.0-alpha.48
- **Latest Stable**: @mui/material 6.x
- **EOL Status**: MUI 4 in maintenance mode only
- **Impact**: Package renamed from @material-ui to @mui; uses JSS (deprecated) vs Emotion
- **Migration Path**: @material-ui/core@4 → @mui/material@5 (codemods available) → @mui/material@6

### Enzyme 3.11.0
- **Status**: Unmaintained (no releases since 2019)
- **Impact**: No adapter for React 17+; blocks React upgrade
- **Migration Path**: Replace with React Testing Library (already partially in project)

### enzyme-adapter-react-16
- **Status**: Tied to React 16 lifecycle
- **Impact**: Completely incompatible with React 17+

## Medium Severity - Outdated Runtime Dependencies

### axios 0.19.2
- **Current**: 0.19.2 (December 2019)
- **Latest**: 1.7.x
- **Security**: Multiple CVEs fixed in 0.21+ and 1.x (prototype pollution, SSRF)
- **Breaking Changes**: FormData handling, response type defaults

### react-router-dom 5.1.2
- **Current**: 5.1.2
- **Latest**: 7.x
- **Impact**: v6 removed Switch/Route render props, introduced element-based routing, loaders/actions
- **Migration**: Significant refactoring needed (Route API completely changed)

### antd 4.1.1
- **Current**: 4.1.1
- **Latest**: 5.x
- **Impact**: Design tokens replace Less variables, CSS-in-JS changed to CSS extract

### bulma 0.8.1
- **Current**: 0.8.1 (2019)
- **Latest**: 1.0.x (2024)
- **Impact**: CSS custom properties, new color system, dart sass requirement

### node-schedule 1.3.2
- **Current**: 1.3.2
- **Latest**: 2.x
- **Impact**: Minor API improvements, bug fixes

### exceljs 3.8.2
- **Current**: 3.8.2
- **Latest**: 4.x
- **Impact**: Streaming improvements, new features

### react-calendar 2.19.2
- **Current**: 2.19.2
- **Latest**: 5.x
- **Impact**: Complete rewrite with new API

### express-fileupload 1.1.7-alpha.2
- **Concern**: Using a pre-release alpha version in production
- **Risk**: Alpha versions may have undiscovered bugs, API changes without notice

### react-autosuggest 10.0.0
- **Status**: Repository archived, unmaintained
- **Alternative**: Use @mui/material Autocomplete or react-select

### bulma-extensions 6.2.7
- **Status**: Unmaintained since 2019
- **Alternative**: Custom CSS or switch to fully-featured framework

## Low Severity - Dev Dependencies

### @testing-library/react 9.5.0
- **Latest**: 16.x
- **Impact**: New APIs (screen, within), better async utilities

### webpack-node-externals 1.7.2
- **Latest**: 3.x
- **Impact**: ESM support, new options

### nodemon 2.0.2
- **Latest**: 3.x
- **Impact**: Minor improvements

## Related Documentation

- [Summary](./summary.md)
- [Remediation Plan](./remediation-plan.md)
- [Dependencies](../architecture/dependencies.md)
- [Dependency Analysis](../analysis/dependency-analysis.md)
