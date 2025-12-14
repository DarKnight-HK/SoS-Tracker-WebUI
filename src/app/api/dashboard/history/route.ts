import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Location } from '@/lib/models';
import { verifyPassword } from '@/lib/auth'; // <--- Import Helper

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const password = req.headers.get('x-admin-password');

  // Check against DB
  const isValid = await verifyPassword(password);
  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  await connectDB();
  const history = await Location.find({}).sort({ timestamp: -1 }).limit(50).lean();
  return NextResponse.json(history);
}
