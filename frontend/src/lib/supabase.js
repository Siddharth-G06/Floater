import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'dummy_key';

const isDummy = supabaseUrl.includes('dummy') || supabaseAnonKey === 'dummy_key';

const realClient = createClient(supabaseUrl, supabaseAnonKey);

// If using dummy keys, we proxy the auth methods to always succeed for local UI development
export const supabase = isDummy ? {
  ...realClient,
  auth: {
    signInWithPassword: async ({ email }) => {
        const mockUser = { id: 'mock-user', email: email || 'dev@floater.app', user_metadata: { current_balance: '50000', business_name: 'Dev Business' } };
        localStorage.setItem('mock_user_email', mockUser.email);
        return { data: { user: mockUser, session: { user: mockUser, access_token: 'mock', refresh_token: 'mock' } }, error: null };
    },
    signUp: async ({ email }) => {
        const mockUser = { id: 'mock-user', email: email || 'dev@floater.app', user_metadata: { current_balance: '50000', business_name: 'Dev Business' } };
        localStorage.setItem('mock_user_email', mockUser.email);
        return { data: { user: mockUser, session: { user: mockUser, access_token: 'mock', refresh_token: 'mock' } }, error: null };
    },
    signOut: async () => {
        localStorage.removeItem('mock_user_email');
        return { error: null };
    },
    getSession: async () => {
        const email = localStorage.getItem('mock_user_email');
        if (!email) return { data: { session: null }, error: null };
        const mockUser = { id: 'mock-user', email, user_metadata: { current_balance: '50000', business_name: 'Dev Business' } };
        return { data: { session: { user: mockUser, access_token: 'mock', refresh_token: 'mock' } }, error: null };
    },
    getUser: async () => {
        const email = localStorage.getItem('mock_user_email');
        const mockUser = email ? { id: 'mock-user', email, user_metadata: { current_balance: '50000', business_name: 'Dev Business' } } : null;
        return { data: { user: mockUser }, error: null };
    },
    onAuthStateChange: (callback) => {
        // Simple mock that calls back immediately
        const email = localStorage.getItem('mock_user_email');
        if (email) callback('SIGNED_IN', { user: { id: 'mock-user', email } });
        return { data: { subscription: { unsubscribe: () => {} } } };
    },
  },
  from: (tableName) => ({
    select: () => ({
      eq: () => ({
        single: async () => {
          if (tableName === 'users') return { data: { id: 'mock-user', business_name: 'Dev Business' }, error: null };
          return { data: null, error: null };
        },
        async: true,
        then: function(onSuccess) {
           // Direct return for simple arrays (obligations)
           if (tableName === 'obligations') {
             onSuccess({ 
               data: [
                 { id: 1, name: "Electricity Bill", amount: 4500, due_date: "2024-03-30", user_id: 'mock-user', relationship_penalty: 5, flexibility_score: 2 },
                 { id: 2, name: "Office Rent", amount: 25000, due_date: "2024-04-01", user_id: 'mock-user', relationship_penalty: 9, flexibility_score: 1 },
                 { id: 3, name: "Vendor Payment: Mills", amount: 12000, due_date: "2024-03-28", user_id: 'mock-user', relationship_penalty: 7, flexibility_score: 5 }
               ], 
               error: null 
             });
           } else {
             onSuccess({ data: [], error: null });
           }
        }
      }),
      async: true,
      then: function(onSuccess) {
        if (tableName === 'obligations') {
          onSuccess({ 
            data: [
              { id: 1, name: "Electricity Bill", amount: 4500, due_date: "2024-03-30", penalty: 5, flexibility: 2 },
              { id: 2, name: "Office Rent", amount: 25000, due_date: "2024-04-01", penalty: 9, flexibility: 1 },
              { id: 3, name: "Vendor Payment: Mills", amount: 12000, due_date: "2024-03-28", penalty: 7, flexibility: 5 }
            ], 
            error: null 
          });
        } else {
          onSuccess({ data: [], error: null });
        }
      }
    }),
    insert: async () => ({ error: null }),
    upsert: async () => ({ error: null }),
  })
} : realClient;
