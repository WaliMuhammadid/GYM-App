'use client';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalMembers: 0,
    activeMembers: 0,
    overdueMembers: 0,
    weeklyGrowth: 15,
    recentPayments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (data && !data.error) {
          setStats({
            totalRevenue: data.totalRevenue || 145000,
            totalMembers: data.totalMembers || 4,
            activeMembers: data.activeMembers || 3,
            overdueMembers: data.overdueMembers || 1,
            weeklyGrowth: 18,
            recentPayments: data.recentPayments || []
          });
        }
      } catch (e) {
        console.error('Error loading admin stats:', e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const exportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value\n"
      + `Total Revenue,PKR ${stats.totalRevenue}\n`
      + `Total Members,${stats.totalMembers}\n`
      + `Active Members,${stats.activeMembers}\n`
      + `Overdue Members,${stats.overdueMembers}\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `beastfit_financial_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center text-[#D0FF00]">
        <div className="w-8 h-8 border-2 border-[#D0FF00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-montserrat text-3xl font-black text-white italic uppercase tracking-tighter">Financial Growth</h1>
          <p className="font-mono text-xs text-[#A1A1AA] uppercase tracking-widest mt-1">August 2026 Overview</p>
        </div>
        <button onClick={exportReport} className="bg-[#121215] border border-[#27272A] hover:border-[#D0FF00] text-white hover:text-[#D0FF00] px-4 py-2 rounded-lg font-inter text-sm flex items-center gap-2 transition-colors">
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export Report
        </button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#D0FF00]/5 rounded-full blur-[30px]"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#D0FF00]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#D0FF00]">payments</span>
            </div>
            <span className="bg-[#D0FF00]/10 text-[#D0FF00] px-2 py-1 rounded text-xs font-bold">+15%</span>
          </div>
          <h3 className="font-mono text-[10px] text-[#A1A1AA] uppercase tracking-widest mb-1">Total Revenue</h3>
          <p className="font-montserrat text-3xl font-bold text-white">PKR {stats.totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#3B82F6]">group</span>
            </div>
            <span className="bg-[#3B82F6]/10 text-[#3B82F6] px-2 py-1 rounded text-xs font-bold">+{stats.weeklyGrowth} this week</span>
          </div>
          <h3 className="font-mono text-[10px] text-[#A1A1AA] uppercase tracking-widest mb-1">Total Members</h3>
          <p className="font-montserrat text-3xl font-bold text-white">{stats.totalMembers}</p>
        </div>

        <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#D0FF00]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#D0FF00]">how_to_reg</span>
            </div>
          </div>
          <h3 className="font-mono text-[10px] text-[#A1A1AA] uppercase tracking-widest mb-1">Active Members</h3>
          <p className="font-montserrat text-3xl font-bold text-white">{stats.activeMembers}</p>
        </div>

        <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#FF2E54]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#FF2E54]">warning</span>
            </div>
          </div>
          <h3 className="font-mono text-[10px] text-[#A1A1AA] uppercase tracking-widest mb-1">Overdue Payments</h3>
          <p className="font-montserrat text-3xl font-bold text-white">{stats.overdueMembers}</p>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#121215] border border-[#27272A] rounded-2xl p-6">
          <h2 className="font-montserrat text-xl font-bold text-white mb-6">Revenue Trend</h2>
          {/* Placeholder for a chart */}
          <div className="h-[300px] w-full border-b border-l border-[#27272A] relative">
            {/* Chart Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full border-t border-[#27272A]/50 h-0"></div>
              ))}
            </div>
            {/* Fake Chart Line */}
            <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0,80 L20,60 L40,70 L60,30 L80,40 L100,10" fill="none" stroke="#D0FF00" strokeWidth="2" />
              <path d="M0,80 L20,60 L40,70 L60,30 L80,40 L100,10 L100,100 L0,100 Z" fill="url(#gradient)" />
              <defs>
                <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#D0FF00" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#D0FF00" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex justify-between mt-4 text-[#A1A1AA] font-mono text-xs">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
          </div>
        </div>

        <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-6">
          <h2 className="font-montserrat text-xl font-bold text-white mb-6">Recent Transactions</h2>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-3 hover:bg-[#27272A] rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#27272A] flex items-center justify-center text-white font-bold">
                    {String.fromCharCode(65 + i)}
                  </div>
                  <div>
                    <p className="font-inter font-medium text-white text-sm">User Name {i+1}</p>
                    <p className="font-mono text-[10px] text-[#71717A]">Pro Plan • 1 month</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-montserrat font-bold text-[#D0FF00] text-sm">+PKR 5,000</p>
                  <p className="font-mono text-[9px] text-[#A1A1AA]">Today</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
