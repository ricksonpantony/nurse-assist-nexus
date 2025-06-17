
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the user making the request
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      })
    }

    console.log('Authenticated user:', user.id)

    // All authenticated users have admin role, so skip role check for creation
    const { method } = req
    const url = new URL(req.url)
    
    let body = null
    try {
      const requestText = await req.text()
      if (requestText.trim()) {
        body = JSON.parse(requestText)
      }
    } catch (parseError) {
      console.log('JSON parse error:', parseError)
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    // Handle create user request (default action when no action specified)
    if (method === 'POST' && (!body?.action || body.action === 'create')) {
      if (!body) {
        return new Response(JSON.stringify({ error: 'Request body is required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }

      const { email, password, full_name } = body

      console.log('Creating user with email:', email)

      if (!email || !password) {
        return new Response(JSON.stringify({ error: 'Email and password are required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }

      // Create user with admin API - all users get admin role
      const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: full_name || email }
      })

      if (createError) {
        console.log('User creation error:', createError)
        return new Response(JSON.stringify({ error: createError.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }

      console.log('User created successfully:', newUser.user.id)

      // Create/update user profile with admin role - ALL USERS GET ADMIN
      const { error: profileError } = await supabaseClient
        .from('user_profiles')
        .upsert({ 
          id: newUser.user.id,
          full_name: full_name || email, 
          role: 'admin' // ALL users are admin
        })

      if (profileError) {
        console.log('Profile creation error:', profileError)
        // Don't fail the whole operation if profile creation fails
      }

      return new Response(JSON.stringify({ success: true, user: newUser.user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Handle delete user request
    if (method === 'POST' && body?.action === 'delete') {
      const { user_id } = body

      console.log('Attempting to delete user:', user_id)

      if (!user_id) {
        return new Response(JSON.stringify({ error: 'User ID is required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }

      // First, clean up related records that reference this user
      try {
        // Update audit logs to set user_id to null instead of deleting them
        console.log('Updating audit logs to remove user reference...')
        const { error: auditLogError } = await supabaseClient
          .from('audit_logs')
          .update({ 
            user_id: null,
            user_email: null // Also clear the email for privacy
          })
          .eq('user_id', user_id)

        if (auditLogError) {
          console.log('Audit log update warning:', auditLogError)
          // Don't fail the operation, just log the warning
        }

        // Delete user profile first
        console.log('Deleting user profile...')
        const { error: profileDeleteError } = await supabaseClient
          .from('user_profiles')
          .delete()
          .eq('id', user_id)

        if (profileDeleteError) {
          console.log('Profile delete warning:', profileDeleteError)
          // Don't fail the operation, just log the warning
        }

        // Now delete the auth user
        console.log('Deleting auth user...')
        const { error: deleteAuthError } = await supabaseClient.auth.admin.deleteUser(user_id)

        if (deleteAuthError) {
          console.log('Auth user delete error:', deleteAuthError)
          return new Response(JSON.stringify({ error: deleteAuthError.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          })
        }

        console.log('User deleted successfully:', user_id)

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      } catch (cleanupError) {
        console.log('Error during cleanup:', cleanupError)
        return new Response(JSON.stringify({ error: 'Failed to clean up user data: ' + cleanupError.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        })
      }
    }

    if (method === 'PUT' && url.pathname.includes('/update-password')) {
      if (!body) {
        return new Response(JSON.stringify({ error: 'Request body is required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }

      const { user_id, new_password } = body

      const { error: updateError } = await supabaseClient.auth.admin.updateUserById(user_id, {
        password: new_password
      })

      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
