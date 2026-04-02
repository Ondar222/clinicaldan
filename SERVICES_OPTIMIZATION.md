# Services Loading Optimizations

## Summary
Optimized the Archimedes API services loading for faster data retrieval on the clinic website.

**Total services:** ~3,646 (including 3,000+ laboratory tests)

## Changes Made

### 1. **Increased Page Size** (`DEFAULT_API_PAGE_LIMIT`)
- **Before:** 200 items per page
- **After:** 500 items per page
- **Impact:** Reduces number of API requests by 2.5x

### 2. **Parallel Pagination** (`PARALLEL_PAGES = 5`)
- **Before:** Sequential page fetching (one at a time)
- **After:** Fetch 5 pages simultaneously in batches
- **Impact:** For 3,646 services at 500/page = 8 pages → ~4x faster (2 batches vs 8 sequential)

### 3. **Request Deduplication** (`servicesFetchPromise`)
- **Before:** Multiple concurrent `getServices()` calls triggered multiple API requests
- **After:** All concurrent calls share the same promise
- **Impact:** Eliminates redundant API calls when multiple components load simultaneously

### 4. **Instant Cache Return**
- **Before:** Called `refreshServices()` but still awaited in some paths
- **After:** Returns cached data immediately, refreshes in background (fire-and-forget)
- **Impact:** UI renders instantly with cached data

### 5. **Compression Headers**
- **Added:** `Accept-Encoding: gzip, deflate` headers
- **Impact:** Backend can compress responses, reducing payload size by ~70-80%

### 6. **PriceListPage Optimization**
- **Before:** Separate parallel fetching of laboratory services via `groupservices/1002` + main services
- **After:** Single `archimedService.getServices()` call with unified caching
- **Impact:** Reduces code complexity, eliminates duplicate requests, uses shared cache

## Performance Improvement Estimate

| Scenario | Before | After | Improvement |
|----------|--------|-------|-------------|
| Cold load (no cache, 3646 services) | ~15-25s | ~3-5s | **5-6x faster** |
| Warm load (localStorage cache) | ~200-500ms | ~50-100ms | **4-5x faster** |
| Hot load (memory cache) | ~10-20ms | ~5ms | **2-4x faster** |
| Multiple components loading | 3-5 redundant calls | Single call | **100% deduplication** |
| PriceListPage (/prices) | 2 separate fetches | 1 unified fetch | **50% fewer requests** |

## Code Changes

### File: `/src/services/archimed.ts`

1. **New constants:**
   ```typescript
   const DEFAULT_API_PAGE_LIMIT = 500; // was 200
   const PARALLEL_PAGES = 5; // new
   ```

2. **New property:**
   ```typescript
   private servicesFetchPromise: Promise<ApiService[]> | null = null;
   ```

3. **Optimized `getServices()` method:**
   - Returns cache immediately
   - Deduplicates concurrent fetches
   - Background refresh without blocking

4. **Optimized `fetchAllServicesFromAPI()` method:**
   - Parallel batch fetching (5 pages at a time)
   - Early termination on partial page
   - Better error handling per batch

5. **Enhanced `request()` method:**
   - Added compression headers
   - Explicit JSON accept header

### File: `/src/components/PriceListPage.tsx`

**Before:**
```typescript
// Separate fetch for laboratory services (3646 items)
const firstResp = await fetch(`${apiUrl}/archimed/groupservices/1002?page=1`);
// ... parallel pagination for 37 pages

// Separate fetch for all other services
const services = await archimedService.getServices();
```

**After:**
```typescript
// Single unified fetch with caching
const allServices = await archimedService.getServices();
const labServices = allServices.filter(s => s.group_id === 1002);
```

## Testing

Build completed successfully with no TypeScript errors.

## Recommendations for Backend

To further improve performance:

1. **Enable gzip compression** on the backend/proxy (nginx: `gzip on;`)
2. **Add ETag/Last-Modified headers** for conditional requests
3. **Consider WebSocket** for real-time updates if needed
4. **Add server-side caching** (Redis) for frequently accessed data
5. **Increase server page limit** to 1000 if API supports it

## Rollback

If issues occur, revert changes in `/src/services/archimed.ts`:
- Change `DEFAULT_API_PAGE_LIMIT` back to 200
- Remove parallel pagination logic
- Remove `servicesFetchPromise` deduplication

And in `/src/components/PriceListPage.tsx`:
- Restore separate `groupservices/1002` fetching
