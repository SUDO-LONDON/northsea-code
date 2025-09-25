import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { PRODUCTS } from '@/lib/products';

export async function POST() {
  try {
    // First, get all existing products to delete them properly
    const { data: existingProducts } = await supabase
      .from('products')
      .select('id');

    // Delete existing products one by one if any exist
    if (existingProducts && existingProducts.length > 0) {
      for (const product of existingProducts) {
        await supabase
          .from('products')
          .delete()
          .eq('id', product.id);
      }
    }

    // Map products to database format with proper column names
    const productsForDB = PRODUCTS.map(p => ({
      id: p.id,
      name: p.name,
      hfo: p.hfo,
      vlsfo: p.vlsfo,
      mgo: p.mgo,
      change: p.change,
      lastupdated: p.lastupdated // fixed: was p.lastUpdated
    }));

    // Insert all products
    const { data, error: insertError } = await supabase
      .from('products')
      .insert(productsForDB)
      .select();

    if (insertError) {
      return NextResponse.json({
        error: 'Failed to insert products',
        details: insertError
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Database initialized successfully with fresh data',
      productsCreated: data?.length || 0,
      products: data?.map(p => ({ id: p.id, name: p.name }))
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Database initialization failed',
      details: error
    }, { status: 500 });
  }
}
