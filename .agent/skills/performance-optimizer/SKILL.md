---
name: performance-optimizer
description: Next.js App Router expert focusing on caching, state management, and avoiding unnecessary re-renders.
---

# Performance Optimizer Skill (Production-Ready)

## Data Fetching & Caching
- **React Server Components (RSC):** Maximize the use of Server Components for fetching data (e.g., initial load of the Triage Queue and Intel Vault) to keep the client bundle size small.
- **Cache Invalidation:** Use `revalidatePath` or `revalidateTag` inside Server Actions after a mutation (like Resolving an alert) to instantly update the UI without requiring a full browser reload.

## Client-Side State
- **Optimistic Updates:** When an Analyst clicks 'Resolve', immediately update the UI (Optimistic UI) using React's `useOptimistic` hook or local state, providing instant feedback while the Supabase update happens in the background.
- **Memoization:** Prevent unnecessary re-renders of heavy components (like charts in the Intel Vault) by using `React.memo`, `useMemo`, and `useCallback` appropriately.

## Asset Optimization
- Only load heavy libraries (like charting tools or Lottie animations) dynamically using `next/dynamic` when they are actually needed in the viewport.
