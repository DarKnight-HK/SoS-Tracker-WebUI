import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Command } from '@/lib/models';
import { verifyPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const password = req.headers.get('x-admin-password');

  const isValid = await verifyPassword(password);
  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { cmd } = await req.json();
    await connectDB();
    await Command.create({ cmd });
    return NextResponse.json({ status: 'queued' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
