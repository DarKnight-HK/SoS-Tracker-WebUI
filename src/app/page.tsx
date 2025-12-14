'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Battery, MapPin, PhoneCall, RefreshCw, LogOut, 
  LayoutDashboard, History, Settings as SettingsIcon, ShieldAlert,
  Save, Menu, X, KeyRound, Sun, Moon
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { useTheme } from 'next-themes';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function Dashboard() {
  const { setTheme, theme } = useTheme();
  
  // Auth State
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // App State
  const [activeTab, setActiveTab] = useState<'map' | 'history' | 'settings'>('map');
  const [history, setHistory] = useState<any[]>([]);
  const [settings, setSettings] = useState({ guardianNumber: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // --- AUTH ---
  useEffect(() => {
    const saved = localStorage.getItem('admin_pass');
    if (saved) {
      verifyServerLogin(saved).then(valid => {
        if (valid) {
          setPassword(saved);
          setIsLoggedIn(true);
          refreshData(saved);
        }
        setCheckingAuth(false);
      });
    } else {
      setCheckingAuth(false);
    }
  }, []);

  const verifyServerLogin = async (pass: string) => {
    try {
      await axios.post('/api/auth/login', { password: pass });
      return true;
    } catch {
      return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const valid = await verifyServerLogin(password);
    setLoading(false);

    if (valid) {
      localStorage.setItem('admin_pass', password);
      setIsLoggedIn(true);
      refreshData(password);
    } else {
      toast.error('Invalid Password. Default is "admin"');
    }
  };

  // --- DATA ---
  const refreshData = (pass: string) => {
    fetchHistory(pass);
    fetchSettings(pass);
  };

  const fetchHistory = async (pass: string) => {
    try {
      const res = await axios.get('/api/dashboard/history', { headers: { 'x-admin-password': pass } });
      setHistory(res.data);
    } catch { }
  };

  const fetchSettings = async (pass: string) => {
    try {
      const res = await axios.get('/api/settings', { headers: { 'x-admin-password': pass } });
      if(res.data) setSettings(s => ({ ...s, guardianNumber: res.data.guardianNumber }));
    } catch { }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(() => fetchHistory(password), 3000);
    return () => clearInterval(interval);
  }, [isLoggedIn, password]);

  // --- ACTIONS ---
  const sendCmd = async (cmd: string) => {
    setLoading(true);
    toast.promise(
      axios.post('/api/dashboard/command', { cmd }, { headers: { 'x-admin-password': password } }),
      {
        loading: 'Transmitting...',
        success: 'Command sent!',
        error: 'Failed.',
      }
    );
    setTimeout(() => setLoading(false), 2000);
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { guardianNumber: settings.guardianNumber };
    if (settings.newPassword && settings.newPassword.trim() !== '') {
      payload.adminPassword = settings.newPassword;
    }

    toast.promise(
      axios.post('/api/settings', payload, { headers: { 'x-admin-password': password } }),
      {
        loading: 'Saving...',
        success: () => {
          if (payload.adminPassword) {
            setPassword(payload.adminPassword);
            localStorage.setItem('admin_pass', payload.adminPassword);
            setSettings(s => ({ ...s, newPassword: '' }));
            return 'Settings & Password Updated!';
          }
          return 'Settings Saved!';
        },
        error: 'Save Failed',
      }
    );
  };

  if (checkingAuth) return (
    <div className="h-[100dvh] bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );

  // --- LOGIN SCREEN ---
  if (!isLoggedIn) {
    return (
      <div className="h-[100dvh] w-full bg-slate-950 flex items-center justify-center relative overflow-hidden px-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="z-10 w-full max-w-sm">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl p-8 shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-blue-600/20 rounded-full flex items-center justify-center border border-blue-500/30">
                <ShieldAlert className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-slate-100 mb-2">System Locked</h1>
            <p className="text-slate-500 text-center text-sm mb-6">Default password is <b>admin</b></p>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input 
                type="password" 
                placeholder="Passkey" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="bg-slate-950/50 border-slate-700 text-white" 
              />
              <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 font-bold">
                {loading ? 'Verifying...' : 'Unlock Console'}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    );
  }

  const last = history[0];

  return (
    // Use 100dvh (Dynamic Viewport Height) to handle mobile browser bars correctly
    <div className="h-[100dvh] w-full bg-background flex flex-col md:flex-row overflow-hidden font-sans transition-colors duration-300">
      <Toaster theme={theme === 'dark' ? 'dark' : 'light'} position="top-right" />

      {/* === MOBILE HEADER === */}
      <div className="md:hidden flex items-center justify-between p-3 bg-card border-b z-30 shrink-0">
        <div className="flex items-center gap-2">
          <MapPin size={20} className="text-primary" />
          <span className="font-bold">SoS Tracker</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
          <Menu />
        </Button>
      </div>

      {/* === SIDEBAR === */}
      <AnimatePresence>
        {(sidebarOpen || typeof window !== 'undefined' && window.innerWidth >= 768) && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            
            <motion.aside 
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className={`
                fixed md:static inset-y-0 left-0 z-50
                w-72 md:w-64 bg-card border-r 
                flex flex-col shadow-2xl md:translate-x-0
              `}
            >
              {/* Logo */}
              <div className="p-6 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-primary rounded flex items-center justify-center shadow-lg shadow-primary/20">
                    <ShieldAlert size={18} className="text-primary-foreground" />
                  </div>
                  <span className="font-bold text-lg tracking-tight">Console</span>
                </div>
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)}>
                  <X />
                </Button>
              </div>

              {/* Status Panel */}
              {last && (
                <div className="p-4 m-4 bg-muted/50 rounded-lg border space-y-3">
                  <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1"><Battery size={12}/> Battery</span>
                      <span className={`text-sm font-mono font-bold ${last.battery > 20 ? 'text-green-500' : 'text-destructive'}`}>{last.battery}%</span>
                  </div>
                  <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-500 ${last.battery > 20 ? 'bg-green-500' : 'bg-destructive'}`} style={{ width: `${last.battery}%` }}></div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-muted-foreground uppercase font-semibold">Signal</span>
                      <Badge variant="outline" className="text-[10px] h-5">{last.type}</Badge>
                  </div>
                </div>
              )}

              {/* Nav */}
              <nav className="flex-1 p-4 space-y-2">
                <SidebarBtn active={activeTab === 'map'} icon={LayoutDashboard} label="Live Map" onClick={() => { setActiveTab('map'); setSidebarOpen(false); }} />
                <SidebarBtn active={activeTab === 'history'} icon={History} label="History" onClick={() => { setActiveTab('history'); setSidebarOpen(false); }} />
                <SidebarBtn active={activeTab === 'settings'} icon={SettingsIcon} label="Settings" onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }} />
              </nav>

              {/* Footer Actions */}
              <div className="p-4 border-t space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  <span className="flex items-center gap-2">
                    {theme === 'dark' ? <Moon size={16}/> : <Sun size={16}/>} 
                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </span>
                </Button>

                <Button variant="ghost" onClick={() => {localStorage.clear(); window.location.reload()}} className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <LogOut size={18} className="mr-2" /> Disconnect
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* === MAIN CONTENT === */}
      <main className="flex-1 relative bg-background overflow-hidden flex flex-col h-full">
        <AnimatePresence mode="wait">
          
          {/* MAP TAB */}
          {activeTab === 'map' && (
            <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-0 flex flex-col">
              
              {/* Map Container - Flex Grow to take available space */}
              <div className="flex-grow relative w-full h-full">
                <Map history={history} />
              </div>

              {/* CONTROLS DOCK - FIXED AT BOTTOM */}
              <div className="absolute bottom-6 left-0 right-0 z-10 px-4 w-full flex justify-center pointer-events-none pb-[env(safe-area-inset-bottom)]">
                <div className="flex gap-3 w-full max-w-sm pointer-events-auto bg-card/10 backdrop-blur-sm p-1 rounded-xl">
                  <Button onClick={() => sendCmd('GET_LOC')} disabled={loading} className="flex-1 bg-card/90 backdrop-blur border text-foreground hover:bg-primary hover:text-primary-foreground shadow-xl h-12 text-sm md:text-base font-bold">
                     <RefreshCw size={18} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Update
                  </Button>
                  <Button onClick={() => sendCmd('ACTIVATE_MIC')} disabled={loading} variant="destructive" className="flex-1 shadow-xl h-12 text-sm md:text-base font-bold">
                     <PhoneCall size={18} className="mr-2" /> Spy Call
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 md:p-8 h-full overflow-auto pb-20">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Location Logs</h2>
              <div className="border rounded-xl overflow-hidden bg-card/50 backdrop-blur shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b">
                      <tr>
                        <th className="px-6 py-4">Time</th>
                        <th className="px-6 py-4">Battery</th>
                        <th className="px-6 py-4">Map</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {history.map((pt, i) => (
                        <tr key={i} className="hover:bg-muted/30">
                          <td className="px-6 py-4 font-mono">{new Date(pt.timestamp).toLocaleString()}</td>
                          <td className="px-6 py-4 text-green-500 font-mono">{pt.battery}%</td>
                          <td className="px-6 py-4">
                            <a href={`https://maps.google.com/?q=${pt.lat},${pt.lng}`} target="_blank" className="text-blue-500 font-bold hover:underline">OPEN</a>
                          </td>
                        </tr>
                      ))}
                      {history.length === 0 && <tr><td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">No logs found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 md:p-8 max-w-xl mx-auto w-full pt-6 md:pt-20 overflow-auto pb-20">
               <h2 className="text-2xl font-bold mb-6">System Settings</h2>
               
               <Card className="p-6 md:p-8 shadow-2xl">
                 <form onSubmit={saveSettings} className="space-y-6">
                   <div className="space-y-3">
                     <label className="text-sm font-medium">Guardian Phone Number</label>
                     <Input 
                       value={settings.guardianNumber} 
                       onChange={(e) => setSettings({...settings, guardianNumber: e.target.value})} 
                       placeholder="+92300..." 
                     />
                   </div>

                   <div className="space-y-3">
                     <label className="text-sm font-medium flex items-center gap-2"><KeyRound size={14}/> Change Admin Password</label>
                     <Input 
                       type="password"
                       value={settings.newPassword} 
                       onChange={(e) => setSettings({...settings, newPassword: e.target.value})} 
                       placeholder="Enter new password" 
                     />
                     <p className="text-xs text-muted-foreground">Default password is <b>admin</b></p>
                   </div>
                   
                   <div className="h-px bg-border my-6"></div>
                   
                   <Button type="submit" className="w-full font-bold h-11">
                     <Save size={18} className="mr-2" /> Save Changes
                   </Button>
                 </form>
               </Card>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}

function SidebarBtn({ active, icon: Icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
        active 
          ? 'bg-primary/10 text-primary font-medium' 
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      <Icon size={18} />
      <span className="text-sm">{label}</span>
    </button>
  );
}
