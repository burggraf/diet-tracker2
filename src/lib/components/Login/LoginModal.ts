import { supabase } from '$services/supabase.service';

export const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin // .origin
      }
    });
    return { user: data.user, session: data.session, error };
  }
  
  export const sendMagicLink = async (email: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    return { user: data.user, session: data.session, error };
  }
  
  export const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    return { user: data.user, session: data.session, error };
  }

  export const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email,
      {
        redirectTo: window.location.origin // + '/resetpassword'
      });
    return { data, error };
  }
  