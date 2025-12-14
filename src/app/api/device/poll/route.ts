import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Command } from '@/lib/models';

// Critical: Prevent Vercel from caching this route
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    
    // Find oldest PENDING command and mark as EXECUTED
    const command = await Command.findOneAndUpdate(
      { status: "PENDING" },
      { status: "EXECUTED" }
    );
    
    return NextResponse.json({ cmd: command ? command.cmd : "NONE" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
