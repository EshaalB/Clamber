/**
 * Offline Cache Utility
 * Provides a fallback for data when the user is offline.
 */

export const cacheData = (key: string, data: any) => {
  try {
    localStorage.setItem(`clamber_cache_${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (err) {
    console.error('Failed to cache data offline', err);
  }
};

export const getCachedData = (key: string) => {
  try {
    const cached = localStorage.getItem(`clamber_cache_${key}`);
    if (!cached) return null;
    return JSON.parse(cached).data;
  } catch (err) {
    return null;
  }
};

export const isOnline = () => window.navigator.onLine;

/**
 * Higher-order function to wrap API calls with offline support
 */
export const withOfflineSupport = async (apiCall: Promise<any>, cacheKey: string) => {
  if (isOnline()) {
    try {
      const response = await apiCall;
      cacheData(cacheKey, response.data);
      return response;
    } catch (err) {
      const cached = getCachedData(cacheKey);
      if (cached) return { data: cached, isOffline: true };
      throw err;
    }
  } else {
    const cached = getCachedData(cacheKey);
    if (cached) return { data: cached, isOffline: true };
    throw new Error('You are offline and no cached data is available.');
  }
};
