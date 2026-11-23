import { useEffect } from 'react';

const APP_NAME = 'Joineazy';

// Sets the browser tab title, e.g. "Assignments | Joineazy".
export const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;
  }, [title]);
};
