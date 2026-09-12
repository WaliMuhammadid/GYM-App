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

  // Timer state for Time Tracker widget
  const [seconds, setSeconds] = useState(5048); // 01:24:08 in seconds
  const [timerRunning, setTimerRunning] = useState(true);

  useEffect(() => {
    let interval;
    if (timerRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTimer = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

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
      <div className="min-h-[500px] flex items-center justify-center text-[#144E36]">
        <div className="w-8 h-8 border-2 border-[#144E36] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activePercent = stats.totalMembers > 0 
    ? Math.round((stats.activeMembers / stats.totalMembers) * 100) 
    : 74;

  return (
    <div className="p-6 md:p-8 space-y-7 bg-white">
      {/* SVG Patterns for Donezo Striped Pillars and Gauges */}
      <svg className="hidden">
        <defs>
          <pattern id="diagonal-stripe" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#46A37C" strokeWidth="2.5" />
          </pattern>
          <pattern id="diagonal-stripe-light" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#94D2BD" strokeWidth="2.5" />
          </pattern>
        </defs>
      </svg>

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-montserrat text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            Plan, prioritize, and accomplish your tasks with ease.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/members"
            className="bg-[#144E36] hover:bg-[#0F3927] text-white px-5 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Member
          </Link>
          <button
            onClick={exportReport}
            className="bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#374151] px-5 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            Export Data
          </button>
        </div>
      </div>

      {/* 4 Top KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Card 1: Total Revenue (Deep Forest Green) */}
        <div className="bg-[#144E36] text-white rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[168px] relative overflow-hidden group">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-white/90">Total Revenue</span>
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white text-xs group-hover:bg-white/10 transition-colors">
              ↗
            </div>
          </div>
          <div className="my-2">
            <p className="font-montserrat text-3xl md:text-4xl font-black tracking-tight">
              PKR {stats.totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 bg-white/15 text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full">
              <span className="text-[10px]">↗</span> +15% Increased from last month
            </span>
          </div>
        </div>

        {/* Card 2: Total Members */}
        <div className="bg-white border border-[#F0F2F4] rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[168px] group hover:border-[#E5E7EB] transition-colors">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-[#4B5563]">Total Members</span>
            <div className="w-8 h-8 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] text-xs group-hover:border-[#144E36] group-hover:text-[#144E36] transition-colors">
              ↗
            </div>
          </div>
          <div className="my-2">
            <p className="font-montserrat text-3xl md:text-4xl font-black text-[#111827] tracking-tight">
              {stats.totalMembers}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 bg-[#F3F4F6] text-[#4B5563] text-[11px] font-medium px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#144E36]"></span> Active Roster
            </span>
          </div>
        </div>

        {/* Card 3: Active Athletes */}
        <div className="bg-white border border-[#F0F2F4] rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[168px] group hover:border-[#E5E7EB] transition-colors">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-[#4B5563]">Active Athletes</span>
            <div className="w-8 h-8 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] text-xs group-hover:border-[#144E36] group-hover:text-[#144E36] transition-colors">
              ↗
            </div>
          </div>
          <div className="my-2">
            <p className="font-montserrat text-3xl md:text-4xl font-black text-[#111827] tracking-tight">
              {stats.activeMembers}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 bg-[#ECFDF5] text-[#059669] text-[11px] font-medium px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span> Paid &amp; Valid
            </span>
          </div>
        </div>

        {/* Card 4: Pending / Overdue */}
        <div className="bg-white border border-[#F0F2F4] rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[168px] group hover:border-[#E5E7EB] transition-colors">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-[#4B5563]">Pending / Overdue</span>
            <div className="w-8 h-8 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] text-xs group-hover:border-[#EF4444] group-hover:text-[#EF4444] transition-colors">
              ↗
            </div>
          </div>
          <div className="my-2">
            <p className="font-montserrat text-3xl md:text-4xl font-black text-[#111827] tracking-tight">
              {stats.overdueMembers}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 bg-[#FEF2F2] text-[#DC2626] text-[11px] font-medium px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"></span> Action Needed
            </span>
          </div>
        </div>
      </div>

      {/* Middle Row Widgets (Analytics + Reminders + Plans) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Project/Gym Analytics Vertical Pill Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-[#F0F2F4] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-montserrat text-base font-bold text-[#111827]">
              Project Analytics
            </h3>
            <span className="text-xs text-[#9CA3AF] font-medium">{currentDateLabel}</span>
          </div>

          {/* Pill Bars for S, M, T, W, T, F, S */}
          <div className="flex items-end justify-between px-2 pt-8 pb-3 h-44">
            {/* Sunday */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-9 sm:w-11 h-24 rounded-full border border-[#46A37C]/40 relative overflow-hidden bg-[#FAFAFA]">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#46A37C_0,#46A37C_1.5px,transparent_0,transparent_6px)] opacity-50"></div>
              </div>
              <span className="text-xs font-medium text-[#9CA3AF]">S</span>
            </div>

            {/* Monday */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-9 sm:w-11 h-32 rounded-full bg-[#144E36] shadow-sm"></div>
              <span className="text-xs font-medium text-[#9CA3AF]">M</span>
            </div>

            {/* Tuesday (With 74% Tooltip Pill Badge) */}
            <div className="flex flex-col items-center gap-2 relative">
              <div className="absolute -top-7 bg-white border border-[#E5E7EB] text-[#144E36] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                74%
              </div>
              <div className="w-9 sm:w-11 h-28 rounded-full bg-[#46A37C]"></div>
              <span className="text-xs font-medium text-[#9CA3AF]">T</span>
            </div>

            {/* Wednesday (Tallest Dark Pill) */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-9 sm:w-11 h-36 rounded-full bg-[#0F3927] shadow-sm"></div>
              <span className="text-xs font-medium text-[#9CA3AF]">W</span>
            </div>

            {/* Thursday */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-9 sm:w-11 h-26 rounded-full border border-[#46A37C]/40 relative overflow-hidden bg-[#FAFAFA]">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#46A37C_0,#46A37C_1.5px,transparent_0,transparent_6px)] opacity-40"></div>
              </div>
              <span className="text-xs font-medium text-[#9CA3AF]">T</span>
            </div>

            {/* Friday */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-9 sm:w-11 h-20 rounded-full border border-[#46A37C]/40 relative overflow-hidden bg-[#FAFAFA]">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#46A37C_0,#46A37C_1.5px,transparent_0,transparent_6px)] opacity-35"></div>
              </div>
              <span className="text-xs font-medium text-[#9CA3AF]">F</span>
            </div>

            {/* Saturday */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-9 sm:w-11 h-28 rounded-full border border-[#46A37C]/40 relative overflow-hidden bg-[#FAFAFA]">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#46A37C_0,#46A37C_1.5px,transparent_0,transparent_6px)] opacity-45"></div>
              </div>
              <span className="text-xs font-medium text-[#9CA3AF]">S</span>
            </div>
          </div>
        </div>

        {/* Reminders Card (3 Cols) */}
        <div className="lg:col-span-3 bg-white border border-[#F0F2F4] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-montserrat text-base font-bold text-[#111827] mb-4">
              Reminders
            </h3>
            
            <div className="mt-2">
              <h4 className="font-montserrat font-bold text-lg text-[#111827] leading-snug">
                Gym Floor &amp; Shift Briefing
              </h4>
              <p className="text-xs text-[#9CA3AF] mt-1.5 font-mono">
                Time : 02.00 pm - 04.00 pm
              </p>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={() => alert('Broadcast notice sent to all active trainers and athletes.')}
              className="w-full bg-[#144E36] hover:bg-[#0F3927] text-white py-3 px-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98"
            >
              <span className="material-symbols-outlined text-[18px]">videocam</span>
              Start Meeting
            </button>
          </div>
        </div>

        {/* Training Plans / Project List (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-[#F0F2F4] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-montserrat text-base font-bold text-[#111827]">
              Training Plans
            </h3>
            <Link
              href="/admin/members"
              className="border border-[#E5E7EB] hover:bg-[#F9FAFB] text-xs font-semibold px-3 py-1 rounded-full text-[#374151] transition-colors"
            >
              + New
            </Link>
          </div>

          <div className="space-y-3.5 my-auto">
            {/* Plan Item 1 */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold text-sm shrink-0">
                //
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#111827] truncate">Strength &amp; Conditioning</p>
                <p className="text-[11px] text-[#9CA3AF]">Active Roster: 18 Athletes</p>
              </div>
            </div>

            {/* Plan Item 2 */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">fitness_center</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#111827] truncate">Personal Training (1-on-1)</p>
                <p className="text-[11px] text-[#9CA3AF]">Gold &amp; Platinum tier</p>
              </div>
            </div>

            {/* Plan Item 3 */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">bolt</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#111827] truncate">CrossFit &amp; High Intensity</p>
                <p className="text-[11px] text-[#9CA3AF]">Morning &amp; Evening batch</p>
              </div>
            </div>

            {/* Plan Item 4 */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FDF2F8] text-[#DB2777] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">speed</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#111827] truncate">Fat Shredder &amp; Cardio</p>
                <p className="text-[11px] text-[#9CA3AF]">Includes body fat tracking</p>
              </div>
            </div>

            {/* Plan Item 5 */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">restaurant</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#111827] truncate">Nutrition &amp; Macro Masterclass</p>
                <p className="text-[11px] text-[#9CA3AF]">Weekly meal plans &amp; diets</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row Widgets (Team Collaboration + Gauge Chart + Time Tracker) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Team Collaboration / Athletes List (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-[#F0F2F4] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-montserrat text-base font-bold text-[#111827]">
              Team Collaboration
            </h3>
            <Link
              href="/admin/members"
              className="border border-[#E5E7EB] hover:bg-[#F9FAFB] text-xs font-semibold px-3 py-1 rounded-full text-[#374151] transition-colors"
            >
              + Add Member
            </Link>
          </div>

          <div className="space-y-3.5">
            {stats.recentPayments?.length > 0 ? (
              stats.recentPayments.slice(0, 4).map((p, idx) => {
                const avatarColors = [
                  'bg-[#FEE2E2] text-[#DC2626]',
                  'bg-[#FEF3C7] text-[#D97706]',
                  'bg-[#E0E7FF] text-[#4F46E5]',
                  'bg-[#F3E8FF] text-[#9333EA]',
                ];
                const avatarColor = avatarColors[idx % avatarColors.length];
                const isPaid = p.status === 'paid';
                const isOverdue = p.status === 'overdue';

                return (
                  <div key={idx} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-full ${avatarColor} font-bold text-xs flex items-center justify-center shrink-0`}>
                        {p.name ? p.name.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#111827] truncate">{p.name}</p>
                        <p className="text-[11px] text-[#9CA3AF] truncate">
                          Working on {p.plan} Training Protocol
                        </p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full shrink-0 ${
                      isPaid
                        ? 'bg-[#ECFDF5] text-[#059669]'
                        : isOverdue
                          ? 'bg-[#FEF2F2] text-[#DC2626]'
                          : 'bg-[#FEF3C7] text-[#D97706]'
                    }`}>
                      {isPaid ? 'Completed' : isOverdue ? 'Pending' : 'In Progress'}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-[#9CA3AF]">
                No recent athlete activity recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Project Progress Gauge Chart (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-[#F0F2F4] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
          <h3 className="font-montserrat text-base font-bold text-[#111827] mb-2">
            Project Progress
          </h3>

          {/* Semi-circular gauge */}
          <div className="relative flex flex-col items-center justify-center my-auto">
            <svg viewBox="0 0 200 110" className="w-52 h-28 overflow-visible">
              {/* Background track arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#F3F4F6"
                strokeWidth="22"
                strokeLinecap="round"
              />
              {/* Striped progress segment */}
              <path
                d="M 130 35 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="url(#diagonal-stripe)"
                strokeWidth="22"
                strokeLinecap="round"
              />
              {/* Active Dark Green Arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 135 32"
                fill="none"
                stroke="#144E36"
                strokeWidth="22"
                strokeLinecap="round"
              />
            </svg>

            {/* Gauge center percentage */}
            <div className="text-center -mt-6">
              <p className="font-montserrat text-3xl md:text-4xl font-black text-[#111827] leading-none">
                {activePercent}%
              </p>
              <p className="text-xs text-[#9CA3AF] mt-1">Project Ended</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-[#F3F4F6] text-[11px] text-[#6B7280]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#144E36]"></span>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#46A37C]"></span>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#94D2BD]"></span>
              <span>Pending</span>
            </div>
          </div>
        </div>

        {/* Time Tracker Card (3 Cols) */}
        <div className="lg:col-span-3 bg-gradient-to-br from-[#0A291C] via-[#0F3927] to-[#081F15] text-white rounded-[24px] p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          {/* Subtle wavy circles matching Donezo card */}
          <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full border border-white/10 pointer-events-none"></div>
          <div className="absolute -right-14 -bottom-14 w-56 h-56 rounded-full border border-white/10 pointer-events-none"></div>
          <div className="absolute -right-20 -bottom-20 w-68 h-68 rounded-full border border-white/5 pointer-events-none"></div>

          <div>
            <p className="text-xs font-medium text-white/80">Time Tracker</p>
          </div>

          <div className="my-6">
            <p className="font-mono text-3xl md:text-4xl font-black tracking-wider text-white">
              {formatTimer(seconds)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className="w-10 h-10 rounded-full bg-white text-[#111827] flex items-center justify-center shadow hover:bg-gray-100 transition-transform active:scale-95"
              title={timerRunning ? 'Pause' : 'Resume'}
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {timerRunning ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <button
              onClick={() => {
                setTimerRunning(false);
                setSeconds(0);
              }}
              className="w-10 h-10 rounded-full bg-[#EF4444] text-white flex items-center justify-center shadow hover:bg-red-600 transition-transform active:scale-95"
              title="Reset Timer"
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                stop
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
