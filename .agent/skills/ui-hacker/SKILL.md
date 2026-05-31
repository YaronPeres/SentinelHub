---
name: ui-hacker-production
description: Manages the production-ready hacker aesthetic, glassmorphism, readability, and Shadcn UI styling.
---
# UI Hacker Skill (Production-Ready)

- **Visuals & Background:** Keep `<LetterGlitch speed={50} />` fixed in the background, but MUST apply a dark overlay (e.g., `<div className="absolute inset-0 bg-background/80 z-[-1]" />`) to ensure high text contrast and reduce visual noise.
- **Components & Feedback:** Exclusively use Shadcn UI components. MUST implement Shadcn `useToast` for all user actions (success/error) and `Skeleton` components for async loading states. Always provide a styled "Empty State" for empty tables.
- **Advanced Glassmorphism:** Apply `bg-black/60` and `backdrop-blur-md` to all Cards and Dialogs. CRITICAL: Add subtle borders (`border border-white/10`) to create depth, and include smooth hover transitions (e.g., `transition-all duration-200 hover:border-cyan-500/30`).
- **Typography Hierarchy:** Use `text-muted-foreground` (gray) for secondary info (timestamps, labels). MUST use monospace font (`font-mono`) for all technical data (IPs, Hashes, IDs).
- **Semantic Colors:** 
  - Red (`text-red-500`, `bg-red-500/10`): Critical Alerts / Breaches.
  - Purple (`text-purple-400`, `bg-purple-500/10`): Distance Anomalies.
  - Cyan (`text-cyan-400`, `bg-cyan-500/10`): Human Error / Primary Actions / Active state.