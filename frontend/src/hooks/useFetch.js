import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../utils/errors';

// Loads data when a page opens. `fetcher` must be a stable function (defined outside the component).
// reload() refreshes quietly in the background, so the page doesn't flash a spinner after every action.
export const useFetch = (fetcher) => {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let ignore = false;

    fetcher()
      .then((data) => !ignore && setState({ data, error: null, loading: false }))
      .catch((error) => !ignore && setState((current) => ({ ...current, error: getErrorMessage(error), loading: false })));

    // Ignore the result if the page closed or a newer request started.
    return () => {
      ignore = true;
    };
  }, [fetcher, version]);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  return { ...state, reload };
};
