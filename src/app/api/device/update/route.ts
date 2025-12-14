import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Location } from '@/lib/models';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    
    // Create new location entry
    await Location.create(body);
    
    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
