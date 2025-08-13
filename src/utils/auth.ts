import { supabase } from '@/integrations/supabase/client';

/**
 * Authentication utilities for quote gating
 */

export interface AuthUser {
  id: string;
  email?: string;
}

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return !!user;
};

/**
 * Requires authentication before proceeding with an action
 * If not authenticated, saves context and redirects to account creation
 */
export const requireAuth = async (
  nextUrl: string, 
  onAuthed: () => void,
  planDraft?: any
) => {
  const authenticated = await isAuthenticated();
  
  if (authenticated) {
    return onAuthed();
  }

  // Save plan draft if provided
  if (planDraft) {
    try {
      sessionStorage.setItem('planDraft', JSON.stringify(planDraft));
    } catch (error) {
      console.error('Error saving plan draft:', error);
    }
  }

  // Save return URL
  try {
    sessionStorage.setItem('returnTo', nextUrl);
  } catch (error) {
    console.error('Error saving return URL:', error);
  }

  // Redirect to account creation
  const returnParam = encodeURIComponent(nextUrl);
  window.location.href = `/create-account?return=${returnParam}`;
};

/**
 * Restores plan draft after authentication
 */
export const restorePlanDraft = (): any | null => {
  try {
    const draft = sessionStorage.getItem('planDraft');
    if (draft) {
      sessionStorage.removeItem('planDraft');
      return JSON.parse(draft);
    }
  } catch (error) {
    console.error('Error restoring plan draft:', error);
  }
  return null;
};

/**
 * Gets and clears return URL
 */
export const getAndClearReturnUrl = (): string | null => {
  try {
    const returnUrl = sessionStorage.getItem('returnTo');
    if (returnUrl) {
      sessionStorage.removeItem('returnTo');
      return returnUrl;
    }
  } catch (error) {
    console.error('Error getting return URL:', error);
  }
  return null;
};