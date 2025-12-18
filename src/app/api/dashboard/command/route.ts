import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { verifyPassword } from '@/lib/auth';

const TALKBACK_ID = "56042";       
const TALKBACK_API_KEY = "NX0ZLDI2G5C0AZP2";      

export async function POST(req: NextRequest) {
  const password = req.headers.get('x-admin-password');
  const isValid = await verifyPassword(password);
  if (!isValid) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const { cmd } = await req.json();
    const url = `https://api.thingspeak.com/talkbacks/${TALKBACK_ID}/commands.json`;
    
    const params = new URLSearchParams();
    params.append('api_key', TALKBACK_API_KEY); // Use the API Key here
    params.append('command_string', cmd);

    await axios.post(url, params);
    
    return NextResponse.json({ status: 'queued', source: 'ThingSpeak' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
