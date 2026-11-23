import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../utils/errors';

// Last successful result per cache key, shared by every page. Pass a `cacheKey` to useFetch and
// revisiting a page shows the previous data instantly while fresh data loads in the background.
const cache = new Map();

// Must run when the logged-in user changes, so nobody ever sees another account's cached data.
export const clearFetchCache = () => cache.clear();

// Loads data when a page opens. `fetcher` must be a stable function (defined outside the component).
// reload() refreshes quietly in the background, so the page doesn't flash a spinner after every action.
export const useFetch = (fetcher, cacheKey) => {
  const [state, setState] = useState(() => {
    const cached = cacheKey ? cache.get(cacheKey) : undefined;
    return cached ? { data: cached, error: null, loading: false } : { data: null, error: null, loading: true };
  });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let ignore = false;

    fetcher()
      .then((data) => {
        if (cacheKey) cache.set(cacheKey, data);
        if (!ignore) setState({ data, error: null, loading: false });
      })
      .catch((error) => !ignore && setState((current) => ({ ...current, error: getErrorMessage(error), loading: false })));

    // Ignore the result if the page closed or a newer request started.
    return () => {
      ignore = true;
    };
  }, [fetcher, cacheKey, version]);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  return { ...state, reload };
};
