# NunaCards — Security Task List

Audited: 2026-06-03. Fix in priority order. Check off as you go.

---

## 🔴 CRITICAL (fix before any real users)

- [x] **OTP brute force — no rate limit**
  - Files: `app/api/auth/otp/send/route.ts`, `app/api/auth/otp/verify/route.ts`
  - Fix: max 5 verify attempts per email → 15-min lockout. Max 3 send requests per email per hour.

- [x] **Payment verification bypass**
  - File: `app/api/payment/verify/route.ts`
  - Fix: after HMAC check, call `razorpay.payments.fetch(razorpay_payment_id)` and assert `status === "captured"` and `amount === 8500`. Without this, anyone with the leaked secret can forge a signature and get PRO free.

- [x] **Secrets in git history**
  - Check if `.env` / `.env.local` was ever committed: `git log --all --full-history -- .env`
  - Result: Never committed. No rotation needed. `.gitignore` already covers both files.

---

## 🟠 HIGH (fix this week)

- [x] **IDOR — any employee can read another employee's leads**
  - File: `app/api/employees/[id]/leads/route.ts`
  - Fix: add `if (session.user.role !== "ADMIN" && session.user.id !== id) return 403`

- [x] **IDOR — any employee can read another employee's scans/views**
  - File: `app/api/employees/[id]/scans/route.ts`
  - Fix: same as above

- [x] **Public card view endpoint can be spammed to inflate metrics**
  - File: `app/api/card/[slug]/view/route.ts`
  - Fix: IP-based rate limit — 1 unique view per IP per 5 min per slug

- [x] **Webhook fails open when secret env var is missing**
  - File: `app/api/webhook/whatsapp/route.ts`
  - Fix: if `!AISENSY_WEBHOOK_SECRET` → return false (fail closed)

- [x] **JSON.parse without try-catch (server crash on bad input)**
  - Files: `app/api/employees/route.ts:95`, `app/api/employees/[id]/route.ts:84`, `app/api/settings/profile/route.ts:46`
  - Fix: wrap each `JSON.parse(labelsRaw)` in try-catch, return 400 on failure

- [x] **Dashboard API accessible by employees (should be admin-only)**
  - File: `app/api/dashboard/route.ts`
  - Fix: change `requireSession()` → `requireAdmin()`

---

## 🟡 MEDIUM (fix before launch)

- [x] **Token version never checked — session revocation doesn't work**
  - File: `lib/session.ts`
  - Fix: in `requireSession()`, fetch current `tokenVersion` from DB and compare to the one in the JWT. If mismatch → throw UNAUTHORIZED.
  - Also: `tokenVersion` now included in JWT via `lib/auth.ts` callbacks.

- [x] **File uploads: no size or MIME type validation**
  - File: `lib/upload.ts`
  - Fix: reject files > 5MB, only allow `image/jpeg`, `image/png`, `image/webp`. Check magic bytes.

- [x] **Raw error messages returned to client**
  - File: `app/api/employees/[id]/send-card/route.ts:50`
  - Fix: return generic "Failed to send card." message to client. Log `err.message` server-side only.

- [x] **Invalid date strings silently become Invalid Date in Prisma queries**
  - File: `app/api/leads/route.ts:27`
  - Fix: after `new Date(startDate)`, check `isNaN(date.getTime())` → return 400

---

## 🔵 LOW (polish)

- [x] **Weak OTP entropy — 6 digits only (1M combinations)**
  - File: `app/api/auth/otp/send/route.ts`
  - Fix: use 8 alphanumeric characters instead of 6 digits

- [x] **Raw phone numbers logged to console (PII leak)**
  - File: `app/api/employees/[id]/send-card/route.ts`
  - Fix: mask logs — only show last 4 digits of phone number

---

## ✅ Already secure

- HMAC signature verification on Razorpay webhook — done
- Prisma parameterized queries — SQL injection not possible
- bcrypt for password hashing — done
- NEXTAUTH_SECRET set — sessions can't be forged
- orgId scoping on all DB queries — cross-org data leakage prevented
- Plan enforcement on both client (UI gate) and server (API 403) — done
