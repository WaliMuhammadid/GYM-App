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
    <div className="p-8 min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="font-montserrat text-3xl font-black text-white italic uppercase tracking-tighter">
            Member Directory
          </h1>
          <p className="font-mono text-xs text-[#A1A1AA] uppercase tracking-widest mt-1">
            Athletes, Access Control &amp; Membership Status
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#D0FF00] text-[#050505] px-6 py-3 rounded-xl font-montserrat font-bold text-sm uppercase tracking-wider flex items-center gap-2 hover:bg-[#b8d300] transition-colors shadow-[0_0_20px_rgba(208,255,0,0.2)]"
        >
          <span className="material-symbols-outlined">person_add</span>
          Add New Member
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#050505] border border-[#27272A] rounded-xl pl-12 pr-4 py-3 text-white placeholder-[#52525B] focus:border-[#D0FF00] outline-none font-inter"
          />
        </form>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-3 rounded-xl font-mono text-xs uppercase font-bold transition-colors ${
              filterStatus === 'all' ? 'bg-[#D0FF00] text-[#050505]' : 'bg-[#27272A] text-white hover:bg-[#35353A]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-3 rounded-xl font-mono text-xs uppercase font-bold transition-colors ${
              filterStatus === 'active' ? 'bg-[#D0FF00] text-[#050505]' : 'bg-[#27272A] text-white hover:bg-[#35353A]'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterStatus('overdue')}
            className={`px-4 py-3 rounded-xl font-mono text-xs uppercase font-bold transition-colors ${
              filterStatus === 'overdue' ? 'bg-[#FF2E54] text-white' : 'bg-[#27272A] text-white hover:bg-[#35353A]'
            }`}
          >
            Overdue
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-[#121215] border border-[#27272A] rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-[#27272A] bg-[#0A0A0A]">
              <th className="p-4 font-mono text-[10px] text-[#A1A1AA] uppercase tracking-widest">Athlete</th>
              <th className="p-4 font-mono text-[10px] text-[#A1A1AA] uppercase tracking-widest">Contact</th>
              <th className="p-4 font-mono text-[10px] text-[#A1A1AA] uppercase tracking-widest">Plan</th>
              <th className="p-4 font-mono text-[10px] text-[#A1A1AA] uppercase tracking-widest">Fee Status</th>
              <th className="p-4 font-mono text-[10px] text-[#A1A1AA] uppercase tracking-widest">Access</th>
              <th className="p-4 font-mono text-[10px] text-[#A1A1AA] uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const isPaid = member.feeStatus === 'paid';
              return (
                <tr key={member._id} className="border-b border-[#27272A] hover:bg-[#1A1A1A] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#27272A] flex items-center justify-center text-[#D0FF00] font-montserrat font-bold">
                        {member.name ? member.name.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div>
                        <p className="font-montserrat font-bold text-white">{member.name}</p>
                        <p className="font-mono text-[10px] text-[#71717A]">
                          Rank: {member.rank || 'Iron Warrior'} (LVL {member.level || 1})
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-inter text-sm text-white">{member.phone || 'N/A'}</p>
                    <p className="font-inter text-xs text-[#A1A1AA]">{member.email}</p>
                  </td>
                  <td className="p-4">
                    <span className="bg-[#27272A] text-white px-2.5 py-1 rounded-lg text-xs font-mono font-bold">
                      {member.plan || 'Gold'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                        isPaid ? 'bg-[#D0FF00]/10 text-[#D0FF00]' : 'bg-[#FF2E54]/10 text-[#FF2E54]'
                      }`}
                    >
                      {member.feeStatus ? member.feeStatus.toUpperCase() : 'PENDING'}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleBlockMember(member._id, member.isBlocked)}
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 transition-colors ${
                        member.isBlocked
                          ? 'bg-[#FF2E54]/20 text-[#FF2E54] border border-[#FF2E54]/30'
                          : 'bg-[#D0FF00]/10 text-[#D0FF00] border border-[#D0FF00]/30'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {member.isBlocked ? 'lock' : 'lock_open'}
                      </span>
                      {member.isBlocked ? 'Blocked' : 'Granted'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => deleteMember(member._id)}
                        className="w-8 h-8 rounded-lg bg-[#FF2E54]/10 text-[#FF2E54] hover:bg-[#FF2E54] hover:text-white flex items-center justify-center transition-colors"
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

        {loading && (
          <div className="p-8 text-center text-[#D0FF00]">
            <div className="w-8 h-8 border-2 border-[#D0FF00] border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        )}

        {!loading && members.length === 0 && (
          <div className="p-8 text-center text-[#71717A] font-inter">No members found matching your search.</div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#121215] border border-[#27272A] rounded-3xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-montserrat text-xl font-black text-white uppercase italic">
                Add New Member
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#A1A1AA] hover:text-white p-2 rounded-full hover:bg-[#27272A]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="font-mono text-xs text-[#71717A] uppercase mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full bg-[#050505] border border-[#27272A] rounded-xl p-3 text-white focus:border-[#D0FF00] outline-none"
                  placeholder="e.g. John Wick"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-xs text-[#71717A] uppercase mb-1 block">Phone</label>
                  <input
                    type="text"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    className="w-full bg-[#050505] border border-[#27272A] rounded-xl p-3 text-white focus:border-[#D0FF00] outline-none"
                    placeholder="03001234567"
                    required
                  />
                </div>
                <div>
                  <label className="font-mono text-xs text-[#71717A] uppercase mb-1 block">Email</label>
                  <input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className="w-full bg-[#050505] border border-[#27272A] rounded-xl p-3 text-white focus:border-[#D0FF00] outline-none"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>
              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-mono text-xs text-[#71717A] uppercase">
                    Assign Password <span className="text-[#D0FF00]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[#D0FF00] hover:underline font-mono text-xs flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-xs">refresh</span>
                    Auto Generate
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newMember.password}
                    onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                    className="w-full bg-[#050505] border border-[#27272A] rounded-xl p-3 pr-12 text-white font-mono text-sm focus:border-[#D0FF00] outline-none"
                    placeholder="Enter athlete login password..."
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                <p className="text-[11px] text-[#71717A] mt-1 font-inter">
                  Athlete will use their email and this password to log in.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-mono text-xs text-[#71717A] uppercase mb-1 block">Plan</label>
                  <select
                    value={newMember.plan}
                    onChange={(e) => {
                      const p = e.target.value;
                      let f = 3000;
                      if (p === 'Gold') f = 5000;
                      if (p === 'Platinum') f = 8000;
                      setNewMember({ ...newMember, plan: p, fee: f });
                    }}
                    className="w-full bg-[#050505] border border-[#27272A] rounded-xl p-3 text-white text-sm focus:border-[#D0FF00] outline-none"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono text-xs text-[#71717A] uppercase mb-1 block">Duration</label>
                  <select
                    value={newMember.durationMonths}
                    onChange={(e) => setNewMember({ ...newMember, durationMonths: Number(e.target.value) })}
                    className="w-full bg-[#050505] border border-[#27272A] rounded-xl p-3 text-white text-sm focus:border-[#D0FF00] outline-none"
                  >
                    <option value={1}>1 Month</option>
                    <option value={3}>3 Months</option>
                    <option value={6}>6 Months</option>
                    <option value={12}>1 Year</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono text-xs text-[#71717A] uppercase mb-1 block">Fee (PKR)</label>
                  <input
                    type="number"
                    value={newMember.fee}
                    onChange={(e) => setNewMember({ ...newMember, fee: Number(e.target.value) })}
                    className="w-full bg-[#050505] border border-[#27272A] rounded-xl p-3 text-white text-sm focus:border-[#D0FF00] outline-none"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-[#D0FF00] text-[#050505] font-montserrat font-black uppercase tracking-wider py-4 rounded-xl mt-4 hover:bg-[#b8d300] transition-colors shadow-[0_0_20px_rgba(208,255,0,0.2)] flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">how_to_reg</span>
                Register Athlete
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Credentials Modal */}
      {registeredCredentials && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#121215] border border-[#D0FF00]/40 rounded-3xl w-full max-w-md p-6 shadow-[0_0_50px_rgba(208,255,0,0.15)] animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 bg-[#D0FF00]/10 border border-[#D0FF00] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[#D0FF00] text-3xl">check_circle</span>
            </div>
            
            <h2 className="font-montserrat text-xl font-black text-white text-center uppercase italic">
              Athlete Registered!
            </h2>
            <p className="font-inter text-xs text-[#A1A1AA] text-center mt-1 mb-6">
              Account created successfully. Share these login credentials with the athlete:
            </p>

            <div className="bg-[#050505] border border-[#27272A] rounded-2xl p-4 space-y-3 font-mono text-sm">
              <div className="flex justify-between items-center border-b border-[#27272A] pb-2">
                <span className="text-[#71717A] text-xs uppercase">Athlete:</span>
                <span className="text-white font-bold">{registeredCredentials.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#27272A] pb-2">
                <span className="text-[#71717A] text-xs uppercase">Email:</span>
                <span className="text-[#D0FF00] select-all">{registeredCredentials.email}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#27272A] pb-2">
                <span className="text-[#71717A] text-xs uppercase">Password:</span>
                <span className="text-white bg-[#1a1a1f] px-2 py-1 rounded select-all font-bold tracking-wider">
                  {registeredCredentials.password}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-[#71717A] pt-1">
                <span>Plan: <b className="text-white">{registeredCredentials.plan}</b></span>
                <span>Duration: <b className="text-white">{registeredCredentials.durationMonths} Month(s)</b></span>
                <span>Fee: <b className="text-white">PKR {registeredCredentials.fee}</b></span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={() => {
                  const text = `🏋️ BeastFit Gym Access Credentials:\nName: ${registeredCredentials.name}\nEmail: ${registeredCredentials.email}\nPassword: ${registeredCredentials.password}\nLogin URL: https://gym-app-ten-lake.vercel.app/login`;
                  navigator.clipboard.writeText(text);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                }}
                className="w-full bg-[#D0FF00] text-[#050505] font-montserrat font-bold text-sm uppercase py-3.5 rounded-xl hover:bg-[#b8d300] transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">
                  {copied ? 'check' : 'content_copy'}
                </span>
                {copied ? 'Credentials Copied!' : 'Copy Credentials'}
              </button>
              
              <button
                onClick={() => setRegisteredCredentials(null)}
                className="w-full bg-[#27272A] text-white font-montserrat text-xs uppercase py-3 rounded-xl hover:bg-[#35353A] transition-colors"
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
