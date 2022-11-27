import { supabase } from '$services/supabase.service';

export const saveProfile = async (profile: any) => {
  const { data, error } = 
  await supabase.from('profile').upsert(profile);
  return { data, error}
}
