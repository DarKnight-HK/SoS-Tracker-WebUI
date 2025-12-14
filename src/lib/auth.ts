import connectDB from '@/lib/db';
import { Settings } from '@/lib/models';

export async function verifyPassword(inputPassword: string | null): Promise<boolean> {
  if (!inputPassword) return false;

  await connectDB();
  
  // Fetch settings
  let settings = await Settings.findOne();
  
  // First Boot Logic: If no settings exist, creating them defaults pass to 'admin'
  if (!settings) {
    settings = await Settings.create({ guardianNumber: '', adminPassword: 'admin' });
  }

  // If database has no password field set (migration case), default to 'admin'
  const dbPass = settings.adminPassword || 'admin';

  return inputPassword === dbPass;
}
