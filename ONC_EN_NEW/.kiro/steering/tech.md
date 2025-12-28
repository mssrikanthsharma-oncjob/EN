# Technology Stack

## Build System & Development

- **Build Tool**: Vite 7.2.4 with React plugin
- **Package Manager**: npm (package-lock.json present)
- **Development Server**: Runs on localhost:9000
- **TypeScript**: ~5.9.3 with strict configuration

## Frontend Framework

- **React**: 19.2.0 with React DOM 19.2.0
- **TypeScript**: Full TypeScript implementation with strict type checking
- **Routing**: React Router DOM 7.11.0 for client-side routing
- **State Management**: React Context API for authentication and form state

## Styling & UI

- **CSS Framework**: Tailwind CSS 4.1.18
- **PostCSS**: 8.5.6 with Autoprefixer 10.4.23
- **Component Architecture**: Custom UI components (Button, Icon) with standardized sizing
- **Icons**: SVG-based icon system with centralized Icon component

## Form Handling & Validation

- **Forms**: React Hook Form 7.69.0 for form state management
- **Validation**: Zod 4.2.1 for schema validation with @hookform/resolvers
- **Multi-step Forms**: Custom implementation with local storage persistence

## Data & Services

- **PDF Generation**: jsPDF 3.0.4 for report generation
- **Local Storage**: Custom utilities for offline data persistence
- **LLM Integration**: Services for OpenAI and Anthropic API integration
- **Currency**: Indian Rupee (INR) formatting utilities

## Code Quality

- **Linting**: ESLint 9.39.1 with TypeScript ESLint 8.46.4
- **React Plugins**: eslint-plugin-react-hooks, eslint-plugin-react-refresh
- **Configuration**: Flat config format with recommended rules

## Common Commands

```bash
# Development
npm run dev          # Start development server on localhost:9000

# Building
npm run build        # TypeScript compilation + Vite build
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint on all files
```

## Project Configuration

- **Vite Config**: Custom port (9000), React plugin enabled
- **TypeScript**: Project references setup with app and node configs
- **Tailwind**: Standard content paths, no custom theme extensions
- **ESLint**: Flat config with TypeScript, React hooks, and refresh plugins