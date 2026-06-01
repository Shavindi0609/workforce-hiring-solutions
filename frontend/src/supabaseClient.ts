// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection for all tables
const testConnections = async () => {
  try {
    // Test users table
    const { count: userCount, error: userError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (userError) {
      console.error('❌ Users table error:', userError.message);
    } else {
      console.log('✅ Users table connected. Count:', userCount);
    }
    
    // Test candidates table
    const { count: candidateCount, error: candidateError } = await supabase
      .from('candidates')
      .select('count', { count: 'exact', head: true });
    
    if (candidateError) {
      console.error('❌ Candidates table error:', candidateError.message);
    } else {
      console.log('✅ Candidates table connected. Count:', candidateCount);
    }
    
    // Test fields table
    const { count: fieldCount, error: fieldError } = await supabase
      .from('fields')
      .select('count', { count: 'exact', head: true });
    
    if (fieldError) {
      console.error('❌ Fields table error:', fieldError.message);
      console.log('💡 Tip: Run the CREATE TABLE script for fields');
    } else {
      console.log('✅ Fields table connected. Count:', fieldCount);
      if (fieldCount === 0) {
        console.log('⚠️ Fields table is empty! Please insert sample data.');
      }
    }
  } catch (err) {
    console.error('Connection test failed:', err);
  }
};

testConnections();