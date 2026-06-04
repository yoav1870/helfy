// backend/tests/api.test.js
// Covers all 23 API routes + /health (26 test entries, 3 intentionally skipped).
// Self-cleaning: cart items and addresses created during the run are deleted
// before the suite finishes. No orders are created.
//
// Prerequisites:
//   npm install node-fetch --save-dev
//   docker compose up  (backend must be running on localhost:5000)
//
// Run:
//   node tests/api.test.js

import fetch from 'node-fetch';

const BASE = 'http://localhost:5000';
const TIMESTAMP = Date.now();

let authCookie = '';
let productId    = null;
let productSlug  = null;
let cartItemId   = null;
let orderId      = null;
let addressId    = null;
let profile      = null;

let passed  = 0;
let failed  = 0;
let skipped = 0;

// ── Helpers ───────────────────────────────────────────────────────────────────

function logPass(label, status, ms) {
  console.log(`✅ PASS  ${label}  [${status}] ${ms}ms`);
  passed++;
}
function logFail(label, status, ms, reason) {
  const note = reason ? `  — ${reason}` : '';
  console.log(`❌ FAIL  ${label}  [${status}] ${ms}ms${note}`);
  failed++;
}
function logSkip(label, reason) {
  console.log(`⏭️  SKIP  ${label}  — ${reason}`);
  skipped++;
}

async function test(label, fn) {
  const start = Date.now();
  try {
    const { ok, status, skip, reason } = await fn();
    const ms = Date.now() - start;
    if (skip)      logSkip(label, reason ?? '');
    else if (ok)   logPass(label, status, ms);
    else           logFail(label, status, ms, reason);
  } catch (err) {
    logFail(label, 'ERR', Date.now() - start, err.message);
  }
}

function auth() {
  return { Cookie: authCookie };
}
function json() {
  return { 'Content-Type': 'application/json', Cookie: authCookie };
}

// ── 1. Health ─────────────────────────────────────────────────────────────────

await test('GET  /health', async () => {
  const res = await fetch(`${BASE}/health`);
  return { ok: res.status === 200, status: res.status };
});

// ── Auth ──────────────────────────────────────────────────────────────────────

await test(`POST /api/auth/signup  (test-temp-${TIMESTAMP}@test.com)`, async () => {
  const res = await fetch(`${BASE}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'Temp',
      lastName: 'Tester',
      email: `test-temp-${TIMESTAMP}@test.com`,
      password: 'Test1234!',
    }),
  });
  const ok = res.status === 200 || res.status === 201;
  return { ok, status: res.status, reason: ok ? undefined : 'expected 200 or 201' };
});

await test('POST /api/auth/login   (test@example.com)', async () => {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com', password: 'Test1234' }),
  });
  const cookie = res.headers.get('set-cookie');
  if (cookie) authCookie = cookie.split(';')[0];
  const ok = res.status === 200 && Boolean(authCookie);
  return { ok, status: res.status, reason: ok ? undefined : 'expected 200 + auth cookie' };
});

await test('GET  /api/auth/me  (authenticated)', async () => {
  const res = await fetch(`${BASE}/api/auth/me`, { headers: auth() });
  return { ok: res.status === 200, status: res.status };
});

// ── Products & Categories ─────────────────────────────────────────────────────

await test('GET  /api/products', async () => {
  const res = await fetch(`${BASE}/api/products`);
  if (res.status === 200) {
    const body = await res.json();
    const items = body.data;
    if (Array.isArray(items) && items.length > 0) {
      productId   = items[0].id;
      productSlug = items[0].slug;
    }
  }
  return { ok: res.status === 200, status: res.status };
});

await test('GET  /api/products?search=headphones', async () => {
  const res = await fetch(`${BASE}/api/products?search=headphones`);
  return { ok: res.status === 200, status: res.status };
});

await test('GET  /api/products?sort=price_asc', async () => {
  const res = await fetch(`${BASE}/api/products?sort=price_asc`);
  return { ok: res.status === 200, status: res.status };
});

await test(`GET  /api/products/:id  (id=${productId})`, async () => {
  if (!productId) return { skip: true, reason: 'no product ID from product list' };
  const res = await fetch(`${BASE}/api/products/${productId}`);
  return { ok: res.status === 200, status: res.status };
});

await test(`GET  /api/products/slug/:slug  (${productSlug})`, async () => {
  if (!productSlug) return { skip: true, reason: 'no slug from product list' };
  const res = await fetch(`${BASE}/api/products/slug/${productSlug}`);
  return { ok: res.status === 200, status: res.status };
});

await test('GET  /api/categories', async () => {
  const res = await fetch(`${BASE}/api/categories`);
  return { ok: res.status === 200, status: res.status };
});

// ── Cart (self-cleaning) ──────────────────────────────────────────────────────

await test('GET  /api/cart  (authenticated)', async () => {
  const res = await fetch(`${BASE}/api/cart`, { headers: auth() });
  return { ok: res.status === 200, status: res.status };
});

await test(`POST /api/cart/items  (productId=${productId}, qty=1)`, async () => {
  if (!productId) return { skip: true, reason: 'no product ID available' };
  const res = await fetch(`${BASE}/api/cart/items`, {
    method: 'POST',
    headers: json(),
    body: JSON.stringify({ productId, quantity: 1 }),
  });
  if (res.status === 200 || res.status === 201) {
    const body = await res.json();
    const items = body.data?.items;
    if (Array.isArray(items)) {
      const match = items.find((i) => (i.productId ?? i.product_id) === productId);
      if (match) cartItemId = match.id;
    }
  }
  const ok = res.status === 200 || res.status === 201;
  return { ok, status: res.status, reason: ok ? undefined : 'expected 200 or 201' };
});

await test(`PUT  /api/cart/items/:itemId  (id=${cartItemId}, qty=2)`, async () => {
  if (!cartItemId) return { skip: true, reason: 'no cart item ID from POST /api/cart/items' };
  const res = await fetch(`${BASE}/api/cart/items/${cartItemId}`, {
    method: 'PUT',
    headers: json(),
    body: JSON.stringify({ quantity: 2 }),
  });
  return { ok: res.status === 200, status: res.status };
});

await test(`DELETE /api/cart/items/:itemId  (id=${cartItemId} — cleanup)`, async () => {
  if (!cartItemId) return { skip: true, reason: 'no cart item ID to remove' };
  const res = await fetch(`${BASE}/api/cart/items/${cartItemId}`, {
    method: 'DELETE',
    headers: auth(),
  });
  return { ok: res.status === 200, status: res.status };
});

await test('DELETE /api/cart  (clear)', async () => {
  return { skip: true, reason: 'would wipe pre-existing cart items — not safe for a read-only run' };
});

// ── Orders ────────────────────────────────────────────────────────────────────

await test('GET  /api/orders  (authenticated)', async () => {
  const res = await fetch(`${BASE}/api/orders`, { headers: auth() });
  if (res.status === 200) {
    const body = await res.json();
    const orders = body.data;
    if (Array.isArray(orders) && orders.length > 0) orderId = orders[0].id;
  }
  return { ok: res.status === 200, status: res.status };
});

await test(`GET  /api/orders/:id  (id=${orderId ?? 'none'})`, async () => {
  if (!orderId) return { skip: true, reason: 'no orders exist for this user yet' };
  const res = await fetch(`${BASE}/api/orders/${orderId}`, { headers: auth() });
  return { ok: res.status === 200, status: res.status };
});

await test('POST /api/orders', async () => {
  return { skip: true, reason: 'creates a real order — not reversible in a read-only run' };
});

// ── Users ─────────────────────────────────────────────────────────────────────

await test('GET  /api/users/profile  (authenticated)', async () => {
  const res = await fetch(`${BASE}/api/users/profile`, { headers: auth() });
  if (res.status === 200) {
    const body = await res.json();
    profile = body.data;
  }
  return { ok: res.status === 200, status: res.status };
});

await test('PUT  /api/users/profile  (same data — no-op)', async () => {
  if (!profile) return { skip: true, reason: 'no profile data from GET /api/users/profile' };
  const { firstName, lastName, email } = profile;
  const res = await fetch(`${BASE}/api/users/profile`, {
    method: 'PUT',
    headers: json(),
    body: JSON.stringify({ firstName, lastName, email }),
  });
  return { ok: res.status === 200, status: res.status };
});

await test('PUT  /api/users/password', async () => {
  return { skip: true, reason: 'changing password would break subsequent test runs' };
});

await test('GET  /api/users/addresses  (authenticated)', async () => {
  const res = await fetch(`${BASE}/api/users/addresses`, { headers: auth() });
  return { ok: res.status === 200, status: res.status };
});

await test('POST /api/users/addresses  (will be cleaned up)', async () => {
  const res = await fetch(`${BASE}/api/users/addresses`, {
    method: 'POST',
    headers: json(),
    body: JSON.stringify({
      firstName: 'Test',
      lastName: 'User',
      addressLine1: '123 Test Street',
      city: 'Tel Aviv',
      state: 'Tel Aviv District',
      postalCode: '61000',
      country: 'Israel',
      isDefault: false,
    }),
  });
  if (res.status === 200 || res.status === 201) {
    const body = await res.json();
    addressId = body.data?.id;
  }
  const ok = res.status === 200 || res.status === 201;
  return { ok, status: res.status, reason: ok ? undefined : 'expected 200 or 201' };
});

await test(`PUT  /api/users/addresses/:id  (id=${addressId})`, async () => {
  if (!addressId) return { skip: true, reason: 'no address ID from POST /api/users/addresses' };
  const res = await fetch(`${BASE}/api/users/addresses/${addressId}`, {
    method: 'PUT',
    headers: json(),
    body: JSON.stringify({
      firstName: 'Updated',
      lastName: 'User',
      addressLine1: '456 Updated Street',
      city: 'Jerusalem',
      state: 'Jerusalem District',
      postalCode: '91000',
      country: 'Israel',
      isDefault: false,
    }),
  });
  return { ok: res.status === 200, status: res.status };
});

await test(`DELETE /api/users/addresses/:id  (id=${addressId} — cleanup)`, async () => {
  if (!addressId) return { skip: true, reason: 'no address ID to delete' };
  const res = await fetch(`${BASE}/api/users/addresses/${addressId}`, {
    method: 'DELETE',
    headers: auth(),
  });
  return { ok: res.status === 200, status: res.status };
});

// ── Auth logout ───────────────────────────────────────────────────────────────

await test('POST /api/auth/logout', async () => {
  const res = await fetch(`${BASE}/api/auth/logout`, {
    method: 'POST',
    headers: auth(),
  });
  return { ok: res.status === 200, status: res.status };
});

// ── Summary ───────────────────────────────────────────────────────────────────

const total = passed + failed + skipped;
console.log('');
console.log('━'.repeat(60));
console.log(`Summary: ${passed}/${total} tests passed  (${skipped} skipped, ${failed} failed)`);
console.log('━'.repeat(60));

if (failed > 0) process.exit(1);
