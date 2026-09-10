'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalMembers: 0,
    activeMembers: 0,
    overdueMembers: 0,
    overdueAmount: 0,
    pendingAmount: 0,
    recentPayments: [],
    planBreakdown: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (data && !data.error) {
          setStats({
            totalRevenue: data.totalRevenue ?? 0,
            totalMembers: data.totalMembers ?? 0,
            activeMembers: data.activeMembers ?? 0,
            overdueMembers: data.overdueMembers ?? 0,
            overdueAmount: data.overdueAmount ?? 0,
            pendingAmount: data.pendingAmount ?? 0,
            recentPayments: data.recentPayments || [],
            planBreakdown: data.planBreakdown || [],
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

  const currentDateLabel = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const exportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value\n"
      + `Total Paid Revenue,PKR ${stats.totalRevenue}\n`
      + `Total Members,${stats.totalMembers}\n`
      + `Active Members,${stats.activeMembers}\n`
      + `Overdue Members,${stats.overdueMembers}\n`
      + `Overdue Amount,PKR ${stats.overdueAmount}\n\n`
      + "Recent Athletes / Transactions\n"
      + "Name,Plan,Fee (PKR),Status,Date\n"
      + stats.recentPayments.map(p => `"${p.name}","${p.plan}",${p.amount},"${p.status}","${new Date(p.date).toLocaleDateString()}"`).join('\n');
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="font-montserrat text-3xl font-black text-white italic uppercase tracking-tighter">Financial &amp; Member Analytics</h1>
          <p className="font-mono text-xs text-[#A1A1AA] uppercase tracking-widest mt-1">Live Database ({currentDateLabel})</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/members" className="bg-[#D0FF00] text-[#050505] hover:bg-[#b8d300] px-4 py-2 rounded-lg font-montserrat font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[18px]">group</span>
            Manage Members
          </Link>
          <button onClick={exportReport} className="bg-[#121215] border border-[#27272A] hover:border-[#D0FF00] text-white hover:text-[#D0FF00] px-4 py-2 rounded-lg font-inter text-xs flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export CSV
          </button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#D0FF00]/10 rounded-full blur-[30px]"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#D0FF00]/10 border border-[#D0FF00]/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#D0FF00]">payments</span>
            </div>
            <span className="bg-[#D0FF00]/15 text-[#D0FF00] px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase">Collected</span>
          </div>
          <h3 className="font-mono text-[10px] text-[#A1A1AA] uppercase tracking-widest mb-1">Total Paid Revenue</h3>
          <p className="font-montserrat text-3xl font-extrabold text-white">PKR {stats.totalRevenue.toLocaleString()}</p>
        </div>

        {/* Total Registered Members */}
        <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#3B82F6]">group</span>
            </div>
            <span className="bg-[#3B82F6]/15 text-[#3B82F6] px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase">Registered</span>
          </div>
          <h3 className="font-mono text-[10px] text-[#A1A1AA] uppercase tracking-widest mb-1">Total Members</h3>
          <p className="font-montserrat text-3xl font-extrabold text-white">{stats.totalMembers}</p>
        </div>

        {/* Active Members */}
        <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#10B981]">verified</span>
            </div>
            <span className="bg-[#10B981]/15 text-[#10B981] px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase">Paid &amp; Active</span>
          </div>
          <h3 className="font-mono text-[10px] text-[#A1A1AA] uppercase tracking-widest mb-1">Active Athletes</h3>
          <p className="font-montserrat text-3xl font-extrabold text-white">{stats.activeMembers}</p>
        </div>

        {/* Overdue Payments */}
        <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#FF2E54]/10 border border-[#FF2E54]/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#FF2E54]">warning</span>
            </div>
            <span className="bg-[#FF2E54]/15 text-[#FF2E54] px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase">Action Needed</span>
          </div>
          <h3 className="font-mono text-[10px] text-[#A1A1AA] uppercase tracking-widest mb-1">Overdue / Blocked</h3>
          <p className="font-montserrat text-3xl font-extrabold text-white">{stats.overdueMembers}</p>
        </div>
      </div>

      {/* Main Breakdown & Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real Plan Distribution */}
        <div className="lg:col-span-1 bg-[#121215] border border-[#27272A] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-montserrat text-lg font-bold text-white uppercase tracking-tight">Active Plans Breakdown</h2>
            <span className="material-symbols-outlined text-[#D0FF00] text-lg">pie_chart</span>
          </div>

          <div className="space-y-4">
            {stats.planBreakdown?.length > 0 ? (
              stats.planBreakdown.map((plan, idx) => {
                const colors = ['#D0FF00', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'];
                const color = colors[idx % colors.length];
                const percentage = stats.totalMembers > 0 ? Math.round((plan.count / stats.totalMembers) * 100) : 0;
                return (
                  <div key={idx} className="bg-[#18181B] border border-[#27272A] rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                        <span className="font-montserrat font-bold text-white text-sm uppercase">{plan._id || 'Standard Plan'}</span>
                      </div>
                      <span className="font-mono text-xs text-[#A1A1AA] font-bold">{plan.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#27272A] rounded-full overflow-hidden mb-2">
                      <div className="h-full rounded-full transition-all" style={{ width: `${percentage}%`, backgroundColor: color }}></div>
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-[#71717A]">
                      <span>Potential Revenue:</span>
                      <span className="text-white font-semibold">PKR {(plan.revenue || 0).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm font-inter text-[#71717A] text-center py-8">No plan statistics recorded yet.</p>
            )}
          </div>
        </div>

        {/* Real Recent Athletes & Transactions */}
        <div className="lg:col-span-2 bg-[#121215] border border-[#27272A] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-montserrat text-lg font-bold text-white uppercase tracking-tight">Recent Athletes &amp; Transactions</h2>
              <p className="font-mono text-[10px] text-[#71717A] uppercase tracking-wider mt-0.5">Live from MongoDB Database</p>
            </div>
            <Link href="/admin/members" className="font-mono text-xs text-[#D0FF00] hover:underline flex items-center gap-1">
              View All Directory <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="space-y-3">
            {stats.recentPayments?.length > 0 ? (
              stats.recentPayments.map((p, i) => {
                const isPaid = p.status === 'paid';
                const isOverdue = p.status === 'overdue';
                return (
                  <div key={i} className="flex justify-between items-center p-3.5 bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] rounded-xl transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                        isPaid 
                          ? 'bg-[#D0FF00]/10 border-[#D0FF00]/30 text-[#D0FF00]' 
                          : isOverdue 
                            ? 'bg-[#FF2E54]/10 border-[#FF2E54]/30 text-[#FF2E54]' 
                            : 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]'
                      }`}>
                        {p.name ? p.name.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div className="truncate">
                        <p className="font-inter font-semibold text-white text-sm truncate">{p.name}</p>
                        <p className="font-mono text-[10px] text-[#71717A] truncate">
                          {p.plan} Plan • {p.email}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-4">
                      <p className={`font-montserrat font-black text-sm ${isPaid ? 'text-[#D0FF00]' : isOverdue ? 'text-[#FF2E54]' : 'text-[#F59E0B]'}`}>
                        {isPaid ? '+' : ''}PKR {(p.amount || 0).toLocaleString()}
                      </p>
                      <div className="flex items-center justify-end gap-1.5 mt-0.5">
                        <span className={`font-mono text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          isPaid ? 'bg-[#D0FF00]/10 text-[#D0FF00]' : isOverdue ? 'bg-[#FF2E54]/10 text-[#FF2E54]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                        }`}>
                          {p.status}
                        </span>
                        <span className="font-mono text-[9px] text-[#71717A]">
                          {new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10">
                <span className="material-symbols-outlined text-4xl text-[#27272A] mb-2">inbox</span>
                <p className="font-inter text-sm text-[#71717A]">No transactions recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
