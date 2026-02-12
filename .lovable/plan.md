

# Convert to Installable PWA with Mobile-First Design

## Overview
Make the app installable on phones (Add to Home Screen) by setting up a Progressive Web App (PWA) configuration, and optimize the UI for mobile phone displays.

## Changes

### 1. Install `vite-plugin-pwa` dependency
- Add `vite-plugin-pwa` to enable service worker and manifest generation

### 2. Configure PWA in `vite.config.ts`
- Add the VitePWA plugin with:
  - App name: "Sentira" (or whichever name you pick)
  - Theme color matching the purple primary
  - Icons (192x192 and 512x512)
  - Display: standalone (full-screen, no browser chrome)
  - `navigateFallbackDenylist: [/^\/~oauth/]` for safety
  - Offline caching strategy

### 3. Update `index.html`
- Add mobile meta tags: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `theme-color`
- Add Apple touch icon link
- Update title and description to match the app name

### 4. Create PWA icons in `public/`
- Generate simple SVG-based icons at 192x192 and 512x512 sizes
- Add `apple-touch-icon.png` for iOS

### 5. Create `/install` page
- A dedicated page with instructions for installing the app
- "Add to Home Screen" button that triggers the browser install prompt
- Visual guide showing how to install on iOS (Share > Add to Home Screen) and Android

### 6. Mobile-First UI Optimizations

**Header (`src/components/Header.tsx`)**
- Make navigation responsive: hamburger menu on mobile, horizontal nav on desktop
- Reduce header height on mobile

**Journal Page (`src/pages/Index.tsx`)**
- Reduce padding for mobile screens
- Make the textarea full-width with smaller minimum height on phones
- Stack the word count and analyze button vertically on small screens
- Adjust font sizes for mobile readability

**Results Page (`src/pages/Results.tsx`)**
- Stack cards vertically on mobile
- Ensure charts/graphs resize properly on small screens

**Dashboard (`src/pages/Dashboard.tsx`)**
- Single-column layout on mobile
- Touch-friendly tap targets (minimum 44px)

**Global (`src/index.css`)**
- Add safe area insets for notched phones (`env(safe-area-inset-*)`)
- Prevent zoom on input focus with `font-size: 16px` on inputs

### 7. Add navigation link to Install page
- Add an "Install" link/button in the header or as a floating prompt

## Technical Notes
- The PWA will work offline after first visit
- Users on iOS install via Share > Add to Home Screen; on Android the browser shows an install banner automatically
- The service worker caches app shell and assets for instant loading
- No backend changes needed -- everything stays client-side with localStorage

