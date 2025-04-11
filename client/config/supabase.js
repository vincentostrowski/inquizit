import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY

// Environment check
const isDevelopment = process.env.NODE_ENV === 'development'

if (!supabaseUrl) {
  const error = 'Supabase URL is missing. Please check your environment variables'
  if (isDevelopment) {
    console.error('❌', error)
    console.info('💡 Make sure you have EXPO_PUBLIC_SUPABASE_URL set in your .env file')
  }
  throw new Error(error)
}

if (!supabaseKey) {
  const error = 'Supabase key is missing. Please check your environment variables'
  if (isDevelopment) {
    console.error('❌', error)
    console.info('💡 Make sure you have EXPO_PUBLIC_SUPABASE_KEY set in your .env file')
  }
  throw new Error(error)
}

// Initialize Supabase client with additional options
// const supabase = createClient(supabaseUrl, supabaseKey, {
//   auth: {
//     autoRefreshToken: true,
//     persistSession: true,
//     detectSessionInUrl: false
//   },
//   global: {
//     headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
//   }
// })

// Initialize Supabase client with additional options
const supabase = createClient(supabaseUrl, supabaseKey)

console.log(supabase);

if (isDevelopment) {
  console.info('✅ Supabase client initialized successfully')
  console.debug('Environment:', process.env.NODE_ENV)
}

export { supabase }