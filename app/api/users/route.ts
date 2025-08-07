import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/users - Mendapatkan daftar users
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const department = searchParams.get('department');

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,department.ilike.%${search}%,role.ilike.%${search}%`);
    }

    if (role) {
      query = query.eq('role', role);
    }

    if (department) {
      query = query.eq('department', department);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Order by name
    query = query.order('name', { ascending: true });

    const { data: users, error, count } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      success: true,
      data: {
        data: users || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages
        }
      }
    });

  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}