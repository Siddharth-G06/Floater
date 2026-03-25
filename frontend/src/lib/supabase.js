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
        const mockUser = { id: 'mock-user', email: email || 'dev@floater.app' };
        localStorage.setItem('mock_user_email', mockUser.email);
        return { data: { user: mockUser, session: { user: mockUser, access_token: 'mock', refresh_token: 'mock' } }, error: null };
    },
    signUp: async ({ email }) => {
        const mockUser = { id: 'mock-user', email: email || 'dev@floater.app' };
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
        const mockUser = { id: 'mock-user', email };
        return { data: { session: { user: mockUser, access_token: 'mock', refresh_token: 'mock' } }, error: null };
    },
    getUser: async () => {
        const email = localStorage.getItem('mock_user_email');
        const mockUser = email ? { id: 'mock-user', email } : null;
        return { data: { user: mockUser }, error: null };
    },
    onAuthStateChange: (callback) => {
        // Simple mock that calls back immediately
        const email = localStorage.getItem('mock_user_email');
        if (email) callback('SIGNED_IN', { user: { id: 'mock-user', email } });
        return { data: { subscription: { unsubscribe: () => {} } } };
    },
  }
} : realClient;
