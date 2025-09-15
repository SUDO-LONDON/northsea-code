import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { PRODUCTS } from '@/lib/products';

export async function POST() {
  try {
    // Check if products table exists and has the correct structure
    const { error: structureError } = await supabase
      .from('products')
      .select('id, name, hfo, vlsfo, mgo, change, lastupdated')  // Use lowercase column name
      .limit(1);

    if (structureError) {
      if (structureError.code === '42P01') { // relation does not exist
        return NextResponse.json({
          error: 'Products table does not exist',
          message: 'Please create the products table in your Supabase database',
          sqlCommand: `
CREATE TABLE products (
  id text PRIMARY KEY,
  name text NOT NULL,
  hfo numeric DEFAULT 0,
  vlsfo numeric DEFAULT 0,
  mgo numeric DEFAULT 0,
  change numeric DEFAULT 0,
  lastupdated text NOT NULL
);
          `.trim(),
          details: structureError
        }, { status: 500 });
      }

      return NextResponse.json({
        error: 'Table structure mismatch',
        message: 'The products table exists but has incorrect structure',
        sqlCommand: `
-- Drop the existing table and recreate it with correct structure
DROP TABLE IF EXISTS products;

CREATE TABLE products (
  id text PRIMARY KEY,
  name text NOT NULL,
  hfo numeric DEFAULT 0,
  vlsfo numeric DEFAULT 0,
  mgo numeric DEFAULT 0,
  change numeric DEFAULT 0,
  lastupdated text NOT NULL
);
        `.trim(),
        details: structureError
      }, { status: 500 });
    }

    // Table exists with correct structure, check if it has data
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // If no data exists, initialize with default products
    if (count === 0) {
      // Map products to use lowercase column name
      const productsForDB = PRODUCTS.map(p => ({
        ...p,
        lastupdated: p.lastUpdated
      }));

      const { error: insertError } = await supabase
        .from('products')
        .insert(productsForDB);

      if (insertError) {
        return NextResponse.json({
          error: 'Failed to initialize products',
          details: insertError
        }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Database initialized successfully',
        productsCreated: PRODUCTS.length
      });
    }

    return NextResponse.json({
      message: 'Database already contains data',
      productCount: count
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json({
      error: 'Database initialization failed',
      details: error
    }, { status: 500 });
  }
}
