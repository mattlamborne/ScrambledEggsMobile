// Placeholder supabase file - functionality disabled
console.log('Supabase placeholder loaded');

export const supabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signUp: () => Promise.resolve({ data: null, error: null }),
    signInWithPassword: () => Promise.resolve({ error: null }),
    resetPasswordForEmail: () => Promise.resolve({ error: null }),
    signOut: () => Promise.resolve({ error: null })
  },
  from: () => ({
    select: () => ({
      eq: () => Promise.resolve({ data: [], error: null })
    }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ error: null }),
    upsert: () => Promise.resolve({ data: null, error: null })
  })
};
