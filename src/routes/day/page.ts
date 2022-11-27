import { supabase } from '$services/supabase.service';
import { loadingBox } from '$services/loadingMessage';
//import { getToday } from '$services/utility.functions.service';

export const getDay = async (id: string) => {
    let loader;
    loader = await loadingBox('loading day...')
    const { data, error } = await supabase.from('days')
      .select()
      .eq('id', id)
      .limit(1)
      .single()
    loader.dismiss();
    return { data, error };
  }

  export const getNextFreeDay = async () => {
    //next_free_day
    const { data, error } = 
    await supabase.rpc('next_free_day');
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
  export const getCurrentWeight = async () => {
    const { data, error } = 
    await supabase.from('days')
    .select('weight')
    .order('date', { ascending: false })
    .limit(1)
    .single(); // return a single object (not an array)
    return { data, error };  
  }
  export const save_day = async (day: any) => {
    const { data, error } = 
    await supabase.from('days')
    .upsert(day);
    return { data, error };
  }
  export const delete_day = async (record: any) => {
    const { data, error } = 
    await supabase.from('days')
    .delete()
    .eq('id', record.id);
    return { data, error };  
  }

  export const search_food_log = async (s: string) => {
    const { data, error } = 
    await supabase.rpc('search_food_log', { string: s});
    return { data, error };  
  }
  export const search_internet = async (s: string) => {
    let data = [];
    let error = null;
    let url = '';
    let isupc = false;
    // check if we have a barcode
    if (s.match(/^[0-9]+$/)) {
      url = 'https://us.openfoodfacts.org/api/v0/product/' + s.trim() + '.json';
      isupc = true;
    } else {
      url = `https://us.openfoodfacts.org/cgi/search.pl?search_terms=${s}&search_simple=1&action=process&json=1&nutriment_0=energy-kcal&nutriment_compare_0=gt&nutriment_value_0=500&fields=code,product_name,nutriments,serving_size&sort_by=product_name`;
    }
    try {
      const response = await fetch(url);
      const json = await response.json();
      if (!response.ok) {
        console.error('** fetch ERROR **', response.statusText);
        error = response.statusText;
        return ({ data: null, error });
      }
      if (isupc) {
        json.products = [json.product];
      }
      if (json && json.products) {
        for (let i = 0; i < json.products.length; i++) {
          const product = json.products[i];     
          let desc = product.serving_size || '';
          if (product.nutriments["energy-kcal_100g"]) {
            if (desc.length > 0) desc += ' - ';
            desc += `${Math.round(product.nutriments["energy-kcal_100g"])} cal/100g`;
          } 
          let calories = product.nutriments['energy-kcal_serving'] || product.nutriments['energy-kcal'];
          if (calories) {
            calories = Math.round(calories);
          } else {
            calories = '???';
          }    
          data.push({
            title: product.product_name,
            calories: calories,
            desc: desc
          })
        }
      }  
    } catch (err) {
      // console.error('** search_internet error **', err);
      const simpleError = (err.toString() + '\n').split('\n')[0];
      console.error('line 1', simpleError)
      error = simpleError;
    }    
    return { data, error };  
  }

  export const saveSettings = async (settings: any) => {
    const { data, error } = await supabase.auth.updateUser({
      data: settings
    })    
    return { data, error };
  }
