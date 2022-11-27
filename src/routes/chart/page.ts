import { supabase } from '$services/supabase.service';
import { loadingBox } from '$services/loadingMessage';

  export const getRPC = async (rpc_name: string, params: any = {}) => {
    let loader;
    loader = await loadingBox('loading day...')
    const { data, error } = 
    await supabase.rpc(rpc_name, params);
    loader.dismiss();
    return { data, error };
  }
