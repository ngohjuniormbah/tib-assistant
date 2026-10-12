## Purpose

This file gives concise, actionable guidance for AI coding agents working in this repository so they're immediately productive. Focus on discovered, reproducible patterns and concrete file examples.

## Big picture

- Framework: Next.js (app router) — project uses Next 16 with Turbopack for local `dev`.
- Backend: PocketBase used as the app's auth and user store. PocketBase client helpers live under `src/pocketbase` (see `src/pocketbase/auth.ts`).
- LLM integrations: The app wraps LLM calls with safety/quotas in `src/lib/llm.ts` and OpenAI client config in `src/lib/openAi.ts`.
- Services & tools: Direct external API wrappers live in `src/services/*` (examples: `src/services/semanticScholar/index.ts`). Assistant tools are MCP-based.
- MCP tools: Assistant-callable tools live on external MCP servers. MCP server registration, tool gallery metadata, and per-assistant default tools located in `src/config/mcpServers.ts` + `src/config/toolGallery.ts` + `src/config/assistants/*.ts`.
- UI: App components live under `src/components` and app routes/layouts under `src/app` (note `layoutWithSidebar` variations).

## What an agent should check first (file tour)

- `package.json` — scripts, dependencies, and tooling (commitizen, husky, storybook).
- `next.config.ts` — CSP and `output: 'standalone'` (deployment implications).
- `src/lib/llm.ts` — how LLM calls are throttled/recorded (must be preserved when changing LLM behavior).
- `src/pocketbase/auth.ts` + `src/pocketbase/usedTokens.ts` — authentication and usage accounting flows.
- `src/services/*` — where external API clients live (wrap new services here).

## Code editing rules for agents

- Preserve server-only markers: do not remove `'use server'` from files that rely on server-only APIs.
- When adding features that call external APIs, add a small wrapper under `src/services` and reference it from UI/server actions.
- If you change PocketBase schemas, run `npm run typegen-pocketbase` and commit the produced `src/types/pocketbase-types.ts`.
- Avoid changing generated or deployment-critical config (e.g. `next.config.ts`'s `output: 'standalone'`) without explicit note.
- Always use HeroUI components when possible, instead of creating custom components.
- Use Tailwind 4 classes when possible and prefer that over custom CSS.
- **Never name a colour in a component.** `src/assets/theme.css` is the single source of truth: HeroUI v3's semantic tokens (`--accent`, `--link`, `--muted`, `--border`, `--separator`, `--default`, `--surface-secondary`, `--surface-tertiary`) in OKLCH, light and dark, in the shape HeroUI's theme builder emits (<https://v3.heroui.com/themes>).
- When implementing modals, use HeroUI, and do this in separate components. Use the `useOverlayState` hook from HeroUI to manage the open/close state of the modal, which should be in the parent component. The child renders `<Modal.Backdrop isOpen={...} onOpenChange={...}>` directly — do **not** wrap it in a `<Modal>` root, which is a React Aria `DialogTrigger` and warns when it has no trigger child.
- For sortable lists, use @dnd-kit and follow the code structure as in `src/components/SortableSwitchList/SortableSwitchList.tsx`
- Always use descriptive variable names, prefer descriptiveness over brevity. E.g. .map(i => i _ 2) is less clear than .map(item => item _ 2).
- Typescript: prefer `Record<string, string>` over an index signature `{ [k: string]: string; }`
- Creating React components: Always create a single component per file. Use a Typescript `type` for the props. Naming convention: `ComponentNameProps`. Use a default export for the component: `export default function ComponentName({ ... }: ComponentNameProps) {}`. Each component needs to be placed in its own folder: e.g. `./ComponentNameProps/ComponentNameProps.tsx`

# Commands

```bash
npm run dev           # Start dev server (with Turbopack)
npm run build         # Production build
npm run lint          # ESLint check
npm run type-check    # TypeScript compilation check
```
