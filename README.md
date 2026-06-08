## 5. A cross-layer interaction bug only visible in a live browser

**What broke**: hitting `/login` while logged out sent the browser into an infinite loop - endless `GET /api/auth/me` requests, full-page reloads, repeat forever.

**Root cause**: three pieces of code, each perfectly reasonable on its own, that happened to form a death spiral together:

1. `AuthContext.checkAuth()` hits `GET /auth/me` on every mount to check for an existing session
2. A logged-out user gets a `401` back - correct behavior, not a bug
3. A global axios interceptor in `api.js` was watching for any `401` and responding with `window.location.href = '/login'` - a hard redirect that reloaded the page, remounted `AuthProvider`, fired `checkAuth()` again, got another `401`, reloaded again, forever

**Why the AI missed it**: none of these three pieces are wrong. A global 401 handler is a completely normal pattern. Checking auth on mount makes sense. Redirecting unauthenticated users is obviously right. The bug doesn't live in any single file - it lives in the gap between them, and it only shows up at runtime, in a browser.

**Fix**: deleted the `if (status === 401) window.location.href = '/login'` block from the interceptor entirely. `ProtectedRoute` handles it. One source of truth.
