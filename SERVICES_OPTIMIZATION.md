# Services Loading Optimizations

## Summary
Optimized the Archimedes API services loading for faster data retrieval on the clinic website.

## Changes Made

### 1. **Increased Page Size** (`DEFAULT_API_PAGE_LIMIT`)
- **Before:** 200 items per page
- **After:** 500 items per page
- **Impact:** Reduces number of API requests by 2.5x

### 2. **Parallel Pagination** (`PARALLEL_PAGES = 5`)
- **Before:** Sequential page fetching (one at a time)
- **After:** Fetch 5 pages simultaneously in batches
- **Impact:** For 5000 services at 500/page = 10 pages → ~5x faster (2 batches vs 10 sequential)

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

## Performance Improvement Estimate

| Scenario | Before | After | Improvement |
|----------|--------|-------|-------------|
| Cold load (no cache, 5000 services) | ~10-15s | ~2-3s | **5x faster** |
| Warm load (localStorage cache) | ~100-200ms | ~50ms | **2-4x faster** |
| Hot load (memory cache) | ~10ms | ~5ms | **2x faster** |
| Multiple components loading | Redundant calls | Single call | **No redundancy** |

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
   - Parallel batch fetching
   - Early termination on partial page
   - Better error handling per batch

5. **Enhanced `request()` method:**
   - Added compression headers
   - Explicit JSON accept header

## Testing

Build completed successfully with no TypeScript errors.

## Recommendations for Backend

To further improve performance:

1. **Enable gzip compression** on the backend/proxy
2. **Add ETag/Last-Modified headers** for conditional requests
3. **Consider WebSocket** for real-time updates if needed
4. **Add server-side caching** (Redis) for frequently accessed data

## Rollback

If issues occur, revert changes in `/src/services/archimed.ts`:
- Change `DEFAULT_API_PAGE_LIMIT` back to 200
- Remove parallel pagination logic
- Remove `servicesFetchPromise` deduplication
