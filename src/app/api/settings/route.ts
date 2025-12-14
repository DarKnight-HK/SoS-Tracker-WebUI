import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Settings } from '@/lib/models';

export const dynamic = 'force-dynamic';

// GET: Fetch current settings
export async function GET(req: NextRequest) {
  const password = req.headers.get('x-admin-password');
  
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  await connectDB();
  
  // Get the first settings document, or create one if missing
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({ guardianNumber: '' });
  }
  
  return NextResponse.json(settings);
}

// POST: Update settings
export async function POST(req: NextRequest) {
  const password = req.headers.get('x-admin-password');
  
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { guardianNumber } = await req.json();
    await connectDB();
    
    // Update the singleton settings document
    const settings = await Settings.findOneAndUpdate(
      {}, 
      { guardianNumber, updatedAt: new Date() }, 
      { upsert: true, new: true }
    );
    
    return NextResponse.json({ status: 'ok', settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
