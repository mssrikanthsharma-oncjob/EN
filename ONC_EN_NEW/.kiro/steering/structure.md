# Project Structure

## Root Directory

```
├── src/                    # Source code
├── public/                 # Static assets
├── dist/                   # Build output
├── node_modules/           # Dependencies
├── .kiro/                  # Kiro configuration and steering
├── .vscode/                # VS Code settings
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── eslint.config.js        # ESLint configuration
```

## Source Code Organization (`src/`)

### Core Application
- `main.tsx` - Application entry point with React StrictMode
- `App.tsx` - Main app component with routing and authentication
- `index.css` - Global styles and Tailwind imports

### Components (`src/components/`)
- `Navigation.tsx` - Main navigation component
- `ProtectedRoute.tsx` - Route protection wrapper
- **Forms** (`forms/`) - Specialized form components:
  - `ObservationForm.tsx` - Site observation data entry
  - `TestResultsForm.tsx` - Laboratory test results
  - `PhotoUploadForm.tsx` - Photo documentation
  - `ConfigurationForm.tsx` - LLM configuration
- **UI** (`ui/`) - Reusable UI components:
  - `Button.tsx` - Standardized button component
  - `Icon.tsx` - Centralized SVG icon system

### Pages (`src/pages/`)
- `LoginPage.tsx` - Authentication interface
- `InputPage.tsx` - Multi-step data collection workflow
- `DownloadPage.tsx` - Report generation and download
- `ReportHistoryPage.tsx` - Historical report management

### Business Logic

#### Contexts (`src/contexts/`)
- `AuthContext.tsx` - Authentication state management

#### Services (`src/services/`)
- `llmService.ts` - LLM API integration (OpenAI, Anthropic)
- `reportService.ts` - PDF report generation with jsPDF
- `reportHistoryService.ts` - Report storage and retrieval

#### Types (`src/types/`)
- `index.ts` - Comprehensive TypeScript type definitions for:
  - Form data structures
  - LLM analysis results
  - Report templates
  - Currency and pricing data

#### Schemas (`src/schemas/`)
- `validation.ts` - Zod validation schemas for all form data

#### Utils (`src/utils/`)
- `localStorage.ts` - Local storage utilities for offline persistence
- `currency.ts` - Indian Rupee (INR) formatting functions

## Architectural Patterns

### Component Organization
- **Pages**: Top-level route components
- **Components**: Reusable UI and business logic components
- **Forms**: Specialized form components with validation
- **UI**: Generic, reusable interface components

### State Management
- **Context API**: Authentication and global state
- **React Hook Form**: Form state and validation
- **Local Storage**: Offline data persistence

### Data Flow
1. **Input**: Multi-step forms collect structured data
2. **Processing**: LLM services analyze data and generate insights
3. **Output**: Report service generates professional PDFs
4. **Storage**: Local storage maintains form state and report history

### File Naming Conventions
- **Components**: PascalCase (e.g., `NavigationComponent.tsx`)
- **Pages**: PascalCase with "Page" suffix (e.g., `InputPage.tsx`)
- **Services**: camelCase with "Service" suffix (e.g., `reportService.ts`)
- **Types**: camelCase for files, PascalCase for interfaces
- **Utils**: camelCase descriptive names

### Import Organization
- External libraries first
- Internal types and interfaces
- Components and services
- Relative imports last