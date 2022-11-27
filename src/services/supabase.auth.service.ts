import { supabase } from '$services/supabase.service';
import type { User } from '@supabase/supabase-js';
import { writable } from 'svelte/store';
export let currentUser: any = writable<User | null>(null);
export let currentProfile: any = writable<any>(null);
const profileTable = __APP_PROFILE_TABLE__;
const profileKey = __APP_PROFILE_KEY__;

supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('onAuthStateChange', event, session);
  console.log('event', event);
  console.log('session', session);
  console.log('session.user', session?.user);
  currentUser.set(session?.user ?? null);
  // if (currentUser?.id) {
  //   console.log('authStateChange: loadProfile here');
  //   loadProfile();
  // } else {
  //   currentProfile.set(null);
  // }
});  

currentUser.subscribe((value: any) => {
  console.log('currentUser.subscribe', value);
  console.log('currentUser?.id', currentUser?.id);
  console.log('value?.id', value?.id);
  if (value?.id) {
    loadProfile(value?.id);
  } else {
    currentProfile.set(null);
  }
})

const loadProfile = async (id: string) => {
  if (!profileTable || !profileKey) return;
  console.log('loadProfile with currentUser.id', currentUser.id);
  const { data, error } = 
  await supabase.from(profileTable)
  .select('*')
  .eq(profileKey, id)
  .limit(1);
  console.log('loadProfile data', data, error);
  if (data && data.length > 0) {
    currentProfile.set(data[0]);
  } else if (error) {
    console.error('loadProfile error', error);
    currentProfile.set(null);
  } else {
    currentProfile.set(null);
  }
}
const loadUser = async () => {
  // get all keys from localStorage
  const keys = Object.keys(localStorage);
  // filter keys to get only supabase.auth.token
  const supabaseToken = keys.filter(key => key.endsWith('-auth-token'));
  if (supabaseToken.length > 0) {
    const { data, error } = await supabase.auth.getUser();
  }
  // this should trigger onAuthStateChange
};
loadUser();

// save settings with user in auth.users table
export const saveSettings = async (settings: any) => {
  const { data, error } = await supabase.auth.updateUser({
    data: settings
  })    
  return { data, error };
}


