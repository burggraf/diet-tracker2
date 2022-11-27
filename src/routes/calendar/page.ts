import { supabase } from '$services/supabase.service';
import { loadingBox } from '$services/loadingMessage';
//import { getToday } from '$services/utility.functions.service';

export const getDays = async () => {
    let loader;
    loader = await loadingBox('loading day...')
    const { data, error } = await supabase.from('days')
      .select('*')
      .order('date', { ascending: false })
      .limit(100);
    loader.dismiss();
    return { data, error };
  }

  export const getDayId = async (date: string) => {
    const { data, error } =
    await supabase.from('days')
    .select('id')
    .eq('date', date.substring(0,10))
    .limit(1)
    .single(); // return a single object (not an array)
    return { data, error };
  }
