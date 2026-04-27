# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev`: Start development server
- `npm run build`: Build production assets
- `npm run preview`: Preview production build locally

## Architecture Overview

This is a Vue 3 application built with Vite, using the following key technologies:

- **Vue 3** with Composition API as the core framework
- **Pinia** for state management (stores located in `src/stores`)
- **Vue Router** for routing (configuration in `src/router`)
- **Element Plus** UI component library with Chinese localization
- **TypeScript** for type safety

The application structure follows standard Vue conventions with:
- `src/components/` - Reusable UI components
- `src/views/` - Page-level components
- `src/router/` - Route configuration
- `src/stores/` - Pinia stores
- `src/styles/` - Global CSS

Key entry point: `src/main.ts` initializes the Vue application with all dependencies.