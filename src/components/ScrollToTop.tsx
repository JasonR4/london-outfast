import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Use setTimeout to ensure this runs after other component effects
    const timer = setTimeout(() => {
      window.scrollTo({ 
        top: 0, 
        left: 0, 
        behavior: 'instant' 
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
};