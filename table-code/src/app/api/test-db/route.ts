import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    // Test with a completely clean approach - manually define the exact data structure
    const testProduct = {
      id: "550e8400-e29b-41d4-a716-446655440999",
      name: "Test Product",
      hfo: 15.50,
      vlsfo: 12.25,
      mgo: 8.75,
      change: 2.5,
      lastupdated: "2025-09-11T17:35:00.000Z"
    };

    // Clear any existing test data
    await supabase.from('products').delete().eq('id', testProduct.id);

    // Insert test product
    const { data: insertData, error: insertError } = await supabase
      .from('products')
      .insert([testProduct])
      .select();

    if (insertError) {
      return NextResponse.json({
        step: 'insert',
        error: 'Failed to insert test product',
        details: insertError
      }, { status: 500 });
    }

    // Now test update
    const { data: updateData, error: updateError } = await supabase
      .from('products')
      .update({
        hfo: 20.00,
        vlsfo: 18.00,
        mgo: 15.00,
        change: 5.0,
        lastupdated: new Date().toISOString()
      })
      .eq('id', testProduct.id)
      .select();

    if (updateError) {
      return NextResponse.json({
        step: 'update',
        error: 'Failed to update test product',
        details: updateError,
        insertSuccess: true
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'All database operations successful',
      insertData: insertData,
      updateData: updateData
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Test failed with exception',
      details: error
    }, { status: 500 });
  }
}
