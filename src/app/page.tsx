'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Battery, MapPin, PhoneCall, RefreshCw, LogOut, 
  LayoutDashboard, History, Settings as SettingsIcon, ShieldAlert,
  Save
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

// Dynamic Map Import to prevent SSR errors
const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function Dashboard() {
  // Auth State
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // App State
  const [activeTab, setActiveTab] = useState<'map' | 'history' | 'settings'>('map');
  const [history, setHistory] = useState<any[]>([]);
  const [settings, setSettings] = useState({ guardianNumber: '' });
  const [loading, setLoading] = useState(false);

  // --- AUTH & DATA FETCHING ---
  useEffect(() => {
    const saved = localStorage.getItem('admin_pass');
    if (saved) { setPassword(saved); setIsLoggedIn(true); refreshData(saved); }
  }, []);

  const refreshData = (pass: string) => {
    fetchHistory(pass);
    fetchSettings(pass);
  };

  const fetchHistory = async (pass: string) => {
    try {
      const res = await axios.get('/api/dashboard/history', { headers: { 'x-admin-password': pass } });
      setHistory(res.data);
    } catch { setIsLoggedIn(false); }
  };

  const fetchSettings = async (pass: string) => {
    try {
      const res = await axios.get('/api/settings', { headers: { 'x-admin-password': pass } });
      if(res.data) setSettings(res.data);
    } catch { }
  };

  // Poll for new data every 3 seconds
  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(() => fetchHistory(password), 3000);
    return () => clearInterval(interval);
  }, [isLoggedIn, password]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('admin_pass', password);
    setIsLoggedIn(true);
    refreshData(password);
  };

  // --- COMMAND LOGIC ---
  const sendCmd = async (cmd: string) => {
    setLoading(true);
    toast.promise(
      axios.post('/api/dashboard/command', { cmd }, { headers: { 'x-admin-password': password } }),
      {
        loading: 'Sending command to satellite...',
        success: `Command sent successfully!`,
        error: 'Failed to reach device.',
      }
    );
    setTimeout(() => setLoading(false), 2000);
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.promise(
      axios.post('/api/settings', settings, { headers: { 'x-admin-password': password } }),
      {
        loading: 'Saving Configuration...',
        success: 'Guardian Number Updated!',
        error: 'Save Failed',
      }
    );
  };

  // --- LOGIN SCREEN ---
  if (!isLoggedIn) {
    return (
      <div className="h-screen w-full bg-slate-950 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="z-10 w-full max-w-sm px-4">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl p-8 shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-blue-600/20 rounded-full flex items-center justify-center border border-blue-500/30">
                <ShieldAlert className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-slate-100 mb-6">System Locked</h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input 
                type="password" 
                placeholder="Admin Passkey" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-600" 
              />
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 font-bold">Authenticate</Button>
            </form>
          </Card>
        </motion.div>
      </div>
    );
  }

  const last = history[0];

  // --- MAIN DASHBOARD LAYOUT ---
  return (
    <div className="h-screen w-full bg-slate-950 flex overflow-hidden text-slate-200 font-sans">
      <Toaster theme="dark" position="top-right" />

      {/* 1. SIDEBAR NAVIGATION */}
      <motion.aside 
        initial={{ x: -100 }} animate={{ x: 0 }} 
        className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-20 shadow-2xl shrink-0"
      >
        {/* Logo Area */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center shadow-lg shadow-blue-900/50">
            <MapPin size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">SoS Tracker</span>
        </div>

        {/* Live Status Panel (Battery & Signal) */}
        {last && (
          <div className="p-4 m-4 bg-slate-950/50 rounded-lg border border-slate-800/50 space-y-3 shadow-inner">
             <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase font-semibold flex items-center gap-1"><Battery size={12}/> Battery</span>
                <span className={`text-sm font-mono font-bold ${last.battery > 20 ? 'text-green-400' : 'text-red-500'}`}>{last.battery}%</span>
             </div>
             {/* Battery Visual Bar */}
             <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${last.battery > 20 ? 'bg-green-500' : 'bg-red-500'}`} 
                  style={{ width: `${last.battery}%` }}
                ></div>
             </div>
             <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500 uppercase font-semibold">Signal Type</span>
                <Badge variant="outline" className="text-[10px] h-5 bg-slate-900 border-slate-700 text-blue-300">{last.type}</Badge>
             </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          <SidebarBtn active={activeTab === 'map'} icon={LayoutDashboard} label="Live Map" onClick={() => setActiveTab('map')} />
          <SidebarBtn active={activeTab === 'history'} icon={History} label="Location History" onClick={() => setActiveTab('history')} />
          <SidebarBtn active={activeTab === 'settings'} icon={SettingsIcon} label="Settings" onClick={() => setActiveTab('settings')} />
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-800">
          <Button variant="ghost" onClick={() => {localStorage.clear(); window.location.reload()}} className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20">
            <LogOut size={18} className="mr-2" /> Disconnect
          </Button>
        </div>
      </motion.aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 relative bg-slate-950 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          
          {/* === TAB 1: LIVE MAP === */}
          {activeTab === 'map' && (
            <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-0">
              <Map history={history} />
              
              {/* Floating Map Controls */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                <Button onClick={() => sendCmd('GET_LOC')} disabled={loading} className="bg-slate-900/90 backdrop-blur border border-slate-700 hover:bg-blue-600 min-w-[150px] shadow-xl text-white">
                   <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Force Update
                </Button>
                <Button onClick={() => sendCmd('ACTIVATE_MIC')} disabled={loading} className="bg-red-600/90 hover:bg-red-500 min-w-[150px] border border-red-500 shadow-xl shadow-red-900/20 text-white">
                   <PhoneCall size={16} className="mr-2" /> Spy Call
                </Button>
              </div>
            </motion.div>
          )}

          {/* === TAB 2: HISTORY TABLE === */}
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-8 h-full overflow-auto">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white"><History /> Location Logs</h2>
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50 backdrop-blur shadow-xl">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-slate-900 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Time</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Battery</th>
                      <th className="px-6 py-4">Coordinates</th>
                      <th className="px-6 py-4 text-right">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {history.map((pt, i) => (
                      <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-slate-300">{new Date(pt.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-4"><Badge variant="outline" className="border-slate-700 text-slate-300">{pt.type}</Badge></td>
                        <td className="px-6 py-4 text-green-400 font-mono">{pt.battery}%</td>
                        <td className="px-6 py-4 font-mono text-slate-500">{pt.lat.toFixed(5)}, {pt.lng.toFixed(5)}</td>
                        <td className="px-6 py-4 text-right">
                          <a href={`https://maps.google.com/?q=${pt.lat},${pt.lng}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs font-bold hover:underline">OPEN MAP</a>
                        </td>
                      </tr>
                    ))}
                    {history.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No logs found. Waiting for device...</td></tr>}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* === TAB 3: SETTINGS === */}
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-8 max-w-2xl mx-auto w-full pt-20">
               <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white"><SettingsIcon /> System Settings</h2>
               
               <Card className="bg-slate-900 border-slate-800 p-8 shadow-2xl">
                 <form onSubmit={saveSettings} className="space-y-6">
                   <div className="space-y-3">
                     <label className="text-sm font-medium text-slate-300">Guardian Phone Number</label>
                     <p className="text-xs text-slate-500">The device will dial this number automatically when "Spy Call" is activated.</p>
                     <div className="flex gap-2">
                       <Input 
                         value={settings.guardianNumber} 
                         onChange={(e) => setSettings({...settings, guardianNumber: e.target.value})} 
                         placeholder="+92300..." 
                         className="bg-slate-950 border-slate-700 text-white focus-visible:ring-blue-500"
                       />
                     </div>
                   </div>
                   
                   <div className="h-px bg-slate-800 my-6"></div>
                   
                   <Button type="submit" className="bg-blue-600 hover:bg-blue-500 w-full font-bold h-11">
                     <Save size={18} className="mr-2" /> Save Configuration
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

// Helper Component for Sidebar Buttons to keep code clean
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
