# Security Hardening Implementation Plan

## Status: ✅ Completed (2026-02-06)

---

## Phase 1: Critical Vulnerabilities (Authentication & Access Control)

### 1. Remove Hardcoded Secrets ✅

**Objective**: Eliminate `admin123` password and hardcoded cryptographic keys from the source code.
**Changes Made**:

- [x] Removed `ADMIN_KEYS` constant from `constants.ts`
- [x] Removed `_loginAsAdmin` bypass function from `AuthContext.tsx`
- [x] Implemented `createFirstAdmin(password)` for secure first-run setup
- [x] Admin is now stored in Yjs `instructors` map with hashed password like all other users

### 2. Secure Signaling Server Access ✅

**Objective**: Prevent unauthorized devices from connecting to the signaling socket.
**Changes Made**:

- [x] Added `authSecret` parameter to `SignalingServer` constructor
- [x] Auth secret is generated using `crypto.randomBytes(32).toString('hex')`
- [x] WebSocket connections require `?token=<authSecret>` in the URL
- [x] Unauthorized connections are immediately rejected with code 1008

### 3. Implement Cryptographic Signatures for Writes ⏸️ (Deferred)

**Note**: Adding Yjs cryptographic signing is a major architectural overhaul. This is deferred until a future release. Mitigation: Only trusted peers on the LAN can join via mDNS discovery.

---

## Phase 2: Medium Vulnerabilities (Infrastructure)

### 1. Upgrade Electron ✅

**Objective**: Patch known CVEs.
**Changes Made**:

- [x] Upgraded `electron` to latest version
- [x] Upgraded `electron-builder` to latest version (26.x)
- [x] `npm audit` now shows 0 vulnerabilities

### 2. Secure Random Number Generation ✅

**Objective**: Replace `Math.random` with `crypto` API.
**Changes Made**:

- [x] `main.ts`: Instance ID now uses `crypto.randomUUID()`
- [x] `server.ts`: Client IDs now use `crypto.randomUUID()`
- [x] Auth secrets use `crypto.randomBytes()`

---

## Verification Checklist

- [x] Build succeeds: `npm run build:electron` ✅
- [x] `npm audit` shows 0 vulnerabilities ✅
- [ ] Manual Test: Attempt to login with `admin123` → Should Fail
- [ ] Manual Test: First-run flow creates admin via UI
- [ ] Manual Test: WebSocket connection without token is rejected

---

## Files Modified

| File | Change |
|------|--------|
| `src/utils/constants.ts` | Removed `ADMIN_KEYS` |
| `src/context/AuthContext.tsx` | Removed `_loginAsAdmin`, added `createFirstAdmin` |
| `src/context/AuthContextDefinition.ts` | Added `createFirstAdmin` to interface |
| `electron-src/main.ts` | Added `crypto` import, auth secret generation |
| `electron-src/signaling/server.ts` | Added URL token authentication |
| `package.json` | Updated `electron` and `electron-builder` |
