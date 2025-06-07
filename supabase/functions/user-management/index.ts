
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

    // Security fix: Check if user has admin/owner role
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile || !['admin', 'owner'].includes(userProfile.role)) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Admin access required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403
      })
    }

    const { method } = req
    const body = method !== 'GET' ? await req.json() : null

    if (method === 'POST' && req.url.includes('/create-user')) {
      const { email, password, full_name, role = 'user' } = body

      // Create user with admin API
      const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
        email,
        password,
        user_metadata: { full_name }
      })

      if (createError) {
        return new Response(JSON.stringify({ error: createError.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }

      // Update user profile with specified role (default to 'user' for security)
      await supabaseClient
        .from('user_profiles')
        .update({ full_name, role: role || 'user' })
        .eq('id', newUser.user.id)

      return new Response(JSON.stringify({ success: true, user: newUser.user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (method === 'DELETE' && req.url.includes('/delete-user')) {
      const { user_id } = body

      // Check if the user to be deleted is an admin
      const { data: targetUserProfile, error: targetProfileError } = await supabaseClient
        .from('user_profiles')
        .select('role')
        .eq('id', user_id)
        .single()

      if (targetProfileError) {
        return new Response(JSON.stringify({ error: 'User profile not found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        })
      }

      // If the user to be deleted is an admin, check if they are the last admin
      if (targetUserProfile.role === 'admin') {
        const { data: adminCount, error: countError } = await supabaseClient
          .from('user_profiles')
          .select('id', { count: 'exact' })
          .eq('role', 'admin')

        if (countError) {
          return new Response(JSON.stringify({ error: 'Failed to check admin count' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
          })
        }

        if (adminCount && adminCount.length <= 1) {
          return new Response(JSON.stringify({ error: 'Cannot delete the last admin user' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          })
        }
      }

      // First, update or delete audit logs that reference this user
      // Option 1: Set user_id to null in audit logs (preserve audit trail)
      await supabaseClient
        .from('audit_logs')
        .update({ user_id: null, user_email: 'deleted_user@system.local' })
        .eq('user_id', user_id)

      // Delete user profile first
      await supabaseClient
        .from('user_profiles')
        .delete()
        .eq('id', user_id)

      // Then delete the auth user
      const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(user_id)

      if (deleteError) {
        return new Response(JSON.stringify({ error: deleteError.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (method === 'PUT' && req.url.includes('/update-password')) {
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
