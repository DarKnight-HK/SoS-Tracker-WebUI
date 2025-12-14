import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const isValid = await verifyPassword(password);

    if (isValid) {
      return NextResponse.json({ status: 'ok' });
    } else {
      return NextResponse.json({ error: 'Invalid Password' }, { status: 401 });
    }
  } catch (e) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
