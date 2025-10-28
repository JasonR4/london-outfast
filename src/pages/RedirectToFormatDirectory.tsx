import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Redirects legacy /formats route to /outdoor-media
 */
export default function RedirectToFormatDirectory() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/outdoor-media', { replace: true });
  }, [navigate]);

  return null;
}
