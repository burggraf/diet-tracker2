import { supabase } from '$services/supabase.service';

export const saveSettings = async (settings: any) => {
    const { data, error } = await supabase.auth.updateUser({
      data: settings
    })    
    return { data, error };
  }
