import { useEffect, useState } from 'react';

export function useFetch(fetcher, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const ctrl = new AbortController(); // unmount/update: cancel the stale request
    setState((s) => ({ ...s, loading: true, error: '' }));
    fetcher(ctrl.signal)
      .then((data) => setState({ data, loading: false, error: '' }))
      .catch((e) => { if (e.name !== 'AbortError') setState({ data: null, loading: false, error: e.message }); });
    return () => ctrl.abort();
  }, [...deps, tick]);
  return { ...state, reload: () => setTick((t) => t + 1) };
}
