'use client';
import { useState, useEffect } from 'react';

export default function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'overdue'
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registeredCredentials, setRegisteredCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  // New member form state
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    plan: 'Gold',
    fee: 3000,
    durationMonths: 1,
  });

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewMember((prev) => ({ ...prev, password: pass }));
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/members?filter=${filterStatus}&search=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      if (data && data.members) {
        setMembers(data.members);
      }
    } catch (e) {
      console.error('Error fetching members:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [filterStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMembers();
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMember.password || newMember.password.trim().length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember),
      });
      const data = await res.json();
      if (res.ok) {
        setRegisteredCredentials({
          name: newMember.name,
          email: newMember.email.toLowerCase(),
          password: newMember.password,
          plan: newMember.plan,
          fee: newMember.fee,
          durationMonths: newMember.durationMonths,
        });
        setShowAddModal(false);
        setNewMember({
          name: '',
          email: '',
          phone: '',
          password: '',
          plan: 'Gold',
          fee: 3000,
          durationMonths: 1,
        });
        fetchMembers();
      } else {
        alert(data.error || 'Failed to add member');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating member');
    }
  };

  const toggleBlockMember = async (id, currentBlocked) => {
    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: !currentBlocked }),
      });
      if (res.ok) {
        fetchMembers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteMember = async (id) => {
    if (confirm('Are you sure you want to remove this athlete?')) {
      try {
        const res = await fetch(`/api/admin/members/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          fetchMembers();
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 bg-white min-h-[85vh]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-montserrat text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight">
            Member Directory
          </h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            Athletes, Access Control &amp; Membership Status
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#144E36] hover:bg-[#0F3927] text-white px-5 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 transition-all shadow-sm active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Add New Member
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-[#F0F2F4] rounded-[24px] p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl pl-11 pr-4 py-2.5 text-[#111827] placeholder-[#9CA3AF] text-sm focus:border-[#144E36] outline-none font-inter transition-colors"
          />
        </form>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-full font-inter text-xs font-semibold transition-all ${
              filterStatus === 'all'
                ? 'bg-[#144E36] text-white shadow-sm'
                : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]'
            }`}
          >
            All Members
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-2 rounded-full font-inter text-xs font-semibold transition-all ${
              filterStatus === 'active'
                ? 'bg-[#144E36] text-white shadow-sm'
                : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterStatus('overdue')}
            className={`px-4 py-2 rounded-full font-inter text-xs font-semibold transition-all ${
              filterStatus === 'overdue'
                ? 'bg-[#EF4444] text-white shadow-sm'
                : 'bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2]'
            }`}
          >
            Overdue
          </button>
        </div>
      </div>

      {/* Members Table Card */}
      <div className="bg-white border border-[#F0F2F4] rounded-[24px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#F0F2F4]">
                <th className="p-4 pl-6 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Athlete</th>
                <th className="p-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Contact</th>
                <th className="p-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Plan</th>
                <th className="p-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Fee Status</th>
                <th className="p-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Access</th>
                <th className="p-4 pr-6 text-xs font-semibold text-[#6B7280] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F4]">
              {members.map((member, idx) => {
                const isPaid = member.feeStatus === 'paid';
                const avatarColors = [
                  'bg-[#ECFDF5] text-[#059669]',
                  'bg-[#EFF6FF] text-[#2563EB]',
                  'bg-[#FEF3C7] text-[#D97706]',
                  'bg-[#F3E8FF] text-[#7C3AED]',
                ];
                const avatarColor = avatarColors[idx % avatarColors.length];

                return (
                  <tr key={member._id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center font-bold text-sm shrink-0`}>
                          {member.name ? member.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-[#111827]">{member.name}</p>
                          <p className="text-xs text-[#9CA3AF]">
                            Rank: {member.rank || 'Iron Warrior'} (LVL {member.level || 1})
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-[#111827]">{member.phone || 'N/A'}</p>
                      <p className="text-xs text-[#6B7280]">{member.email}</p>
                    </td>
                    <td className="p-4">
                      <span className="bg-[#F3F4F6] text-[#374151] px-3 py-1 rounded-full text-xs font-semibold">
                        {member.plan || 'Gold'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${
                          isPaid ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#FEF2F2] text-[#DC2626]'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-[#059669]' : 'bg-[#DC2626]'}`}></span>
                        {member.feeStatus ? member.feeStatus.toUpperCase() : 'PENDING'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleBlockMember(member._id, member.isBlocked)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          member.isBlocked
                            ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] hover:bg-[#FEE2E2]'
                            : 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] hover:bg-[#D1FAE5]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {member.isBlocked ? 'lock' : 'lock_open'}
                        </span>
                        {member.isBlocked ? 'Blocked' : 'Granted'}
                      </button>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => deleteMember(member._id)}
                          className="w-8 h-8 rounded-full bg-[#FEF2F2] text-[#DC2626] hover:bg-[#DC2626] hover:text-white flex items-center justify-center transition-colors shadow-sm"
                          title="Delete Athlete"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="p-12 text-center text-[#144E36]">
            <div className="w-8 h-8 border-2 border-[#144E36] border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        )}

        {!loading && members.length === 0 && (
          <div className="p-12 text-center text-[#9CA3AF] text-sm">
            No members found matching your search.
          </div>
        )}
      </div>

      {/* Add Member Modal (Donezo Styled) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5E7EB] rounded-[32px] w-full max-w-lg p-7 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-montserrat text-xl font-bold text-[#111827]">
                  Add New Member
                </h2>
                <p className="text-xs text-[#6B7280] mt-0.5">Register a new gym member and assign login access.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#9CA3AF] hover:text-[#111827] p-2 rounded-full hover:bg-[#F3F4F6] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1 block">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-3 text-[#111827] text-sm focus:border-[#144E36] outline-none transition-colors"
                  placeholder="e.g. John Wick"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1 block">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-3 text-[#111827] text-sm focus:border-[#144E36] outline-none transition-colors"
                    placeholder="03001234567"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1 block">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-3 text-[#111827] text-sm focus:border-[#144E36] outline-none transition-colors"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password Assignment Field */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-[#374151] uppercase tracking-wider">
                    Assign Password <span className="text-[#144E36]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[#144E36] hover:underline text-xs font-medium flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">refresh</span>
                    Auto Generate
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newMember.password}
                    onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-3 pr-12 text-[#111827] font-mono text-sm focus:border-[#144E36] outline-none transition-colors"
                    placeholder="Enter athlete login password..."
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827]"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                <p className="text-[11px] text-[#9CA3AF] mt-1">
                  Athlete will use their email and this password to log in to both mobile app and web.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1 block">Plan</label>
                  <select
                    value={newMember.plan}
                    onChange={(e) => {
                      const p = e.target.value;
                      let f = 3000;
                      if (p === 'Gold') f = 5000;
                      if (p === 'Platinum') f = 8000;
                      setNewMember({ ...newMember, plan: p, fee: f });
                    }}
                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-3 text-[#111827] text-sm focus:border-[#144E36] outline-none transition-colors"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1 block">Duration</label>
                  <select
                    value={newMember.durationMonths}
                    onChange={(e) => setNewMember({ ...newMember, durationMonths: Number(e.target.value) })}
                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-3 text-[#111827] text-sm focus:border-[#144E36] outline-none transition-colors"
                  >
                    <option value={1}>1 Month</option>
                    <option value={3}>3 Months</option>
                    <option value={6}>6 Months</option>
                    <option value={12}>1 Year</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-1 block">Fee (PKR)</label>
                  <input
                    type="number"
                    value={newMember.fee}
                    onChange={(e) => setNewMember({ ...newMember, fee: Number(e.target.value) })}
                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-3 text-[#111827] text-sm focus:border-[#144E36] outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full bg-[#144E36] hover:bg-[#0F3927] text-white font-semibold py-3.5 rounded-full transition-all shadow-sm flex items-center justify-center gap-2 active:scale-98"
                >
                  <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                  Register Athlete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Credentials Modal (Donezo Styled) */}
      {registeredCredentials && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5E7EB] rounded-[32px] w-full max-w-md p-7 shadow-2xl">
            <div className="w-14 h-14 bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[#059669] text-3xl">check_circle</span>
            </div>
            
            <h2 className="font-montserrat text-xl font-bold text-[#111827] text-center">
              Athlete Registered!
            </h2>
            <p className="text-xs text-[#6B7280] text-center mt-1 mb-5">
              Account created successfully. Share these login credentials with the athlete:
            </p>

            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-4 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-2">
                <span className="text-[#6B7280] uppercase">Athlete:</span>
                <span className="text-[#111827] font-bold">{registeredCredentials.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-2">
                <span className="text-[#6B7280] uppercase">Email:</span>
                <span className="text-[#144E36] font-bold select-all">{registeredCredentials.email}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-2">
                <span className="text-[#6B7280] uppercase">Password:</span>
                <span className="text-[#111827] bg-white border border-[#E5E7EB] px-2 py-0.5 rounded select-all font-bold tracking-wider">
                  {registeredCredentials.password}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#6B7280] pt-1">
                <span>Plan: <b className="text-[#111827]">{registeredCredentials.plan}</b></span>
                <span>Duration: <b className="text-[#111827]">{registeredCredentials.durationMonths} Mo</b></span>
                <span>Fee: <b className="text-[#111827]">PKR {registeredCredentials.fee}</b></span>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  const text = `🏋️ BeastFit Gym Access Credentials:\nName: ${registeredCredentials.name}\nEmail: ${registeredCredentials.email}\nPassword: ${registeredCredentials.password}\nLogin URL: https://gym-app-ten-lake.vercel.app/login`;
                  navigator.clipboard.writeText(text);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                }}
                className="w-full bg-[#144E36] hover:bg-[#0F3927] text-white font-semibold text-sm py-3 rounded-full transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98"
              >
                <span className="material-symbols-outlined text-base">
                  {copied ? 'check' : 'content_copy'}
                </span>
                {copied ? 'Credentials Copied!' : 'Copy Credentials'}
              </button>
              
              <button
                onClick={() => setRegisteredCredentials(null)}
                className="w-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] font-semibold text-xs py-2.5 rounded-full transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
