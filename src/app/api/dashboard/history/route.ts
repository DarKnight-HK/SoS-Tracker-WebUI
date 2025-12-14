import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Location } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const password = req.headers.get('x-admin-password');

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  await connectDB();
  // Fetch last 50 points
  const history = await Location.find({}).sort({ timestamp: -1 }).limit(50).lean();
  return NextResponse.json(history);
}
