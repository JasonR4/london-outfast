import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Redirects legacy /what-is-media-buying route to canonical URL
 */
export default function RedirectToMediaBuying() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/what-is-media-buying-in-london', { replace: true });
  }, [navigate]);

  return null;
}
