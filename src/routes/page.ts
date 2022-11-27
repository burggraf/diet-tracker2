import { supabase } from '$services/supabase.service';
import { loadingBox } from '$services/loadingMessage';
import { getToday } from '$services/utility.functions.service';
// export const saveProfile = async (profile: any) => {
//   const { data, error } = 
//   await supabase.from('profile').upsert(profile);
//   return { data, error}
// }

export const load_today = async () => {
    let loader;
    loader = await loadingBox('loading today...')
    const { data, error } = await supabase.from('days')
      .select()
      .eq('date', getToday())
      .limit(1)
      .single()
    loader.dismiss();
    return { data, error };
  }


