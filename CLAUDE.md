# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript + Vite application using modern web development tools and libraries. The project is configured with:

- **React 19** with TypeScript for the frontend
- **Vite 7** for build tooling and development server
- **Tailwind CSS 4** for styling with the new Vite plugin
- **shadcn/ui** component library (New York style) with Radix UI primitives
- **ESLint** with TypeScript support for code quality

## Development Commands

### Start development server
```bash
npm run dev
```

### Build for production
```bash
npm run build
```
This runs TypeScript compilation (`tsc -b`) followed by Vite build.

### Lint code
```bash
npm run lint
```

### Preview production build
```bash
npm run preview
```

## Architecture & Structure

### Directory Structure
- `src/` - Main application source code
  - `components/ui/` - shadcn/ui components (reusable UI primitives)
  - `lib/` - Utility functions and shared code
  - `assets/` - Static assets like images and SVGs
- Root configuration files for build tools, linting, and TypeScript

### Key Configuration Files
- `vite.config.ts` - Vite configuration with React and Tailwind plugins, path aliases
- `eslint.config.js` - ESLint configuration using the new flat config format
- `tsconfig.json` - TypeScript project references setup
- `components.json` - shadcn/ui configuration for component generation
- `tailwind.config.js` - Tailwind CSS configuration (if present)

### Component System
The project uses **shadcn/ui** for UI components:
- Components are installed in `src/components/ui/`
- Uses Radix UI primitives with custom styling
- Configured for "New York" style with CSS variables
- Path aliases configured: `@/` maps to `./src/`

### Styling
- **Tailwind CSS 4** with the new Vite plugin (`@tailwindcss/vite`)
- CSS variables enabled for theming
- Main styles in `src/index.css`
- Base color: neutral

### TypeScript Configuration
- Project uses TypeScript 5.8+ with project references
- Path mapping configured: `@/*` maps to `./src/*`
- Separate configs for app (`tsconfig.app.json`) and Node.js (`tsconfig.node.json`)

## Adding shadcn/ui Components

When adding new UI components, use the shadcn/ui CLI or manually create them following the existing pattern in `src/components/ui/`. The project is configured with:
- Style: "new-york"
- CSS variables enabled
- Lucide React for icons
- Component aliases already set up

## Notes

- No test framework is currently configured
- Uses the new Tailwind CSS 4 with Vite plugin (not PostCSS)
- ESLint uses the modern flat config format
- React Refresh enabled for fast development