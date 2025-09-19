import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Signup API received body:', body);
    const { companyName, position, country, phone, email, password } = body;

    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    // Hash the password
    const password_hash = await bcrypt.hash(password, 10);
    console.log('Password hash generated');

    // Insert into user_signups table
    const { error, data } = await supabase.from('user_signups').insert([
      {
        company_name: companyName,
        position,
        country,
        phone,
        email,
        password_hash,
      },
    ]);
    console.log('Insert result:', { error, data });

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Signup API error:', err);
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
