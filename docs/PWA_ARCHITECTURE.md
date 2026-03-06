# SteadLog PWA Architecture

## Purpose
SteadLog is configured as an installable Progressive Web App (PWA) so the app shell can load quickly, continue working in poor connectivity, and integrate with the existing offline action queue.

## PWA Design
SteadLog uses `vite-plugin-pwa` with Workbox-generated service workers.

Core settings:
- `registerType: autoUpdate` for automatic SW update checks
- Web manifest for installability (`name`, `short_name`, icons, `display: standalone`)
- Theme color and app icons for home-screen install support

No manual service-worker registration is added in application code; registration is handled by the plugin.

## Offline Logging Strategy
SteadLog already has an offline-first logging queue in `src/features/steadlog/offlineQueue.ts` and queue-aware API behavior in `src/features/steadlog/api.ts`.

PWA caching does not replace this logic. Instead:
- Cached app shell keeps UI available when offline
- Quick Log remains accessible while offline
- `createHomesteadAction` continues queueing unsynced actions in local storage
- Sync continues through existing queue flush behavior when connectivity returns

This preserves current functional behavior while improving resilience and startup speed.

## Service Worker Caching Strategy
Runtime caching rules are scoped to static/browser assets only:
- `document` requests: `NetworkFirst` (`pages` cache)
- `script` and `style`: `StaleWhileRevalidate` (`assets` cache)
- `image`: `CacheFirst` (`images` cache)

Navigation fallback is enabled with `navigateFallback: '/index.html'` so client routes can still resolve when offline.

### API Caching Policy
Supabase/API calls are intentionally not included in runtime caching patterns.

Because API requests do not match the configured `document/script/style/image` patterns, they are not cached by Workbox runtime strategies.

## Deployment Behavior
Build output now includes:
- `manifest.webmanifest`
- generated service worker files (`sw.js`, Workbox assets)

Deployment requirements:
- Serve the built `dist/` output as static assets
- Do not block service worker files from being served
- Keep SPA route fallback to `index.html` enabled at web server/proxy level

## Offline Validation Checklist
1. Load SteadLog once while online.
2. Open browser devtools and disable network.
3. Refresh the page.

Expected behavior:
- App shell still loads
- Routes continue resolving through the cached shell
- Quick Log panel opens
- New logs queue locally and sync later when online
