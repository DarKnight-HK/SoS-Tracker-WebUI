'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Battery, MapPin, PhoneCall, RefreshCw, LogOut, 
  LayoutDashboard, History, Settings as SettingsIcon, ShieldAlert,
  Save, Menu, X, KeyRound
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function Dashboard() {
  // Auth State
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // App State
  const [activeTab, setActiveTab] = useState<'map' | 'history' | 'settings'>('map');
  const [history, setHistory] = useState<any[]>([]);
  const [settings, setSettings] = useState({ guardianNumber: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar state

// --- AUTH ---
  useEffect(() => {
    const saved = localStorage.getItem('admin_pass');
    if (saved) {
      // Verify saved password against server
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
  }, []);  const verifyServerLogin = async (pass: string) => {
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
    
    // Only send password if user typed something
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
            setSettings(s => ({ ...s, newPassword: '' })); // Clear field
            return 'Settings & Password Updated!';
          }
          return 'Settings Saved!';
        },
        error: 'Save Failed',
      }
    );
  };

  // Prevent flash of login screen while checking localstorage
if (checkingAuth) return (
  <div className="h-screen bg-slate-950 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-400 text-sm animate-pulse">Connecting to Secure Server...</p>
    </div>
  </div>
);
  // --- LOGIN SCREEN ---
  if (!isLoggedIn) {
    return (
      <div className="h-screen w-full bg-slate-950 flex items-center justify-center relative overflow-hidden px-4">
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
    <div className="h-screen w-full bg-slate-950 flex flex-col md:flex-row overflow-hidden text-slate-200 font-sans">
      <Toaster theme="dark" position="top-right" />

      {/* === MOBILE HEADER === */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 z-30">
        <div className="flex items-center gap-2">
          <MapPin size={20} className="text-blue-500" />
          <span className="font-bold text-white">SoS Tracker</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
          <Menu className="text-slate-200" />
        </Button>
      </div>

      {/* === SIDEBAR (Responsive) === */}
      <AnimatePresence>
        {(sidebarOpen || typeof window !== 'undefined' && window.innerWidth >= 768) && (
          <>
            {/* Mobile Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            
            {/* Sidebar Content */}
            <motion.aside 
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className={`
                fixed md:static inset-y-0 left-0 z-50
                w-72 md:w-64 bg-slate-900 border-r border-slate-800 
                flex flex-col shadow-2xl md:translate-x-0
              `}
            >
              {/* Desktop Logo / Mobile Close */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center shadow-lg shadow-blue-900/50">
                    <ShieldAlert size={18} className="text-white" />
                  </div>
                  <span className="font-bold text-lg tracking-tight text-white">Console</span>
                </div>
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)}>
                  <X className="text-slate-400" />
                </Button>
              </div>

              {/* Status Panel */}
              {last && (
                <div className="p-4 m-4 bg-slate-950/50 rounded-lg border border-slate-800/50 space-y-3">
                  <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 uppercase font-semibold flex items-center gap-1"><Battery size={12}/> Battery</span>
                      <span className={`text-sm font-mono font-bold ${last.battery > 20 ? 'text-green-400' : 'text-red-500'}`}>{last.battery}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-500 ${last.battery > 20 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${last.battery}%` }}></div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-500 uppercase font-semibold">Signal</span>
                      <Badge variant="outline" className="text-[10px] h-5 bg-slate-900 border-slate-700 text-blue-300">{last.type}</Badge>
                  </div>
                </div>
              )}

              {/* Nav */}
              <nav className="flex-1 p-4 space-y-2">
                <SidebarBtn active={activeTab === 'map'} icon={LayoutDashboard} label="Live Map" onClick={() => { setActiveTab('map'); setSidebarOpen(false); }} />
                <SidebarBtn active={activeTab === 'history'} icon={History} label="History" onClick={() => { setActiveTab('history'); setSidebarOpen(false); }} />
                <SidebarBtn active={activeTab === 'settings'} icon={SettingsIcon} label="Settings" onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }} />
              </nav>

              <div className="p-4 border-t border-slate-800">
                <Button variant="ghost" onClick={() => {localStorage.clear(); window.location.reload()}} className="w-full justify-start text-red-400 hover:bg-red-900/20">
                  <LogOut size={18} className="mr-2" /> Disconnect
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* === MAIN CONTENT === */}
      <main className="flex-1 relative bg-slate-950 overflow-hidden flex flex-col h-full">
        <AnimatePresence mode="wait">
          
          {/* MAP TAB */}
          {activeTab === 'map' && (
            <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-0">
              <Map history={history} />
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10 w-full max-w-sm px-4 justify-center">
                <Button onClick={() => sendCmd('GET_LOC')} disabled={loading} className="bg-slate-900/90 backdrop-blur border border-slate-700 hover:bg-blue-600 shadow-xl flex-1">
                   <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Update
                </Button>
                <Button onClick={() => sendCmd('ACTIVATE_MIC')} disabled={loading} className="bg-red-600/90 hover:bg-red-500 border border-red-500 shadow-xl shadow-red-900/20 flex-1">
                   <PhoneCall size={16} className="mr-2" /> Spy Call
                </Button>
              </div>
            </motion.div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 md:p-8 h-full overflow-auto">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white">Location Logs</h2>
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50 backdrop-blur shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-xs uppercase bg-slate-900 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Time</th>
                        <th className="px-6 py-4">Battery</th>
                        <th className="px-6 py-4">Map</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {history.map((pt, i) => (
                        <tr key={i} className="hover:bg-slate-800/50">
                          <td className="px-6 py-4 text-slate-300">{new Date(pt.timestamp).toLocaleString()}</td>
                          <td className="px-6 py-4 text-green-400">{pt.battery}% <span className="text-slate-600 text-xs ml-1">({pt.type})</span></td>
                          <td className="px-6 py-4">
                            <a href={`https://maps.google.com/?q=${pt.lat},${pt.lng}`} target="_blank" className="text-blue-400 font-bold hover:underline">OPEN</a>
                          </td>
                        </tr>
                      ))}
                      {history.length === 0 && <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-500">No logs found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 md:p-8 max-w-xl mx-auto w-full pt-10 md:pt-20">
               <h2 className="text-2xl font-bold mb-6 text-white">System Settings</h2>
               
               <Card className="bg-slate-900 border-slate-800 p-6 md:p-8 shadow-2xl">
                 <form onSubmit={saveSettings} className="space-y-6">
                   
                   <div className="space-y-3">
                     <label className="text-sm font-medium text-slate-300">Guardian Phone Number</label>
                     <Input 
                       value={settings.guardianNumber} 
                       onChange={(e) => setSettings({...settings, guardianNumber: e.target.value})} 
                       placeholder="+92300..." 
                       className="bg-slate-950 border-slate-700 text-white"
                     />
                   </div>

                   <div className="space-y-3">
                     <label className="text-sm font-medium text-slate-300 flex items-center gap-2"><KeyRound size={14}/> Change Admin Password</label>
                     <Input 
                       type="password"
                       value={settings.newPassword} 
                       onChange={(e) => setSettings({...settings, newPassword: e.target.value})} 
                       placeholder="Enter new password (leave empty to keep current)" 
                       className="bg-slate-950 border-slate-700 text-white"
                     />
                     <p className="text-xs text-slate-500">Default password is <b>admin</b></p>
                   </div>
                   
                   <div className="h-px bg-slate-800 my-6"></div>
                   
                   <Button type="submit" className="bg-blue-600 hover:bg-blue-500 w-full font-bold h-11">
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
          ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
          : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
      }`}
    >
      <Icon size={18} className={`transition-colors ${active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
