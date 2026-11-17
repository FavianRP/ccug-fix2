'use client';

import React, { useEffect, useState } from 'react';
import {
  User,
  Plus,
  Edit2,
  Trash2,
  X,
  LogOut,
  AlertCircle,
  ExternalLink,
  Github,
  Linkedin,
  Shield,
  Search,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type Member = {
  _id: string;
  name: string;
  description: string;
  tags: string[];
  avatar?: string;
  joinDate?: string;
  github?: string;
  linkedin?: string;
  ctftime?: string;
  blog: boolean;
  createdAt: string;
};

type UserType = {
  username: string;
  role: 'admin' | 'user';
};

const EXPERTISE_COLORS: Record<string, { bg: string; text: string }> = {
  Leader: { bg: 'bg-[#2a2614] border-[#5e5320]', text: 'text-[#ffd54f]' },
  Reverse: { bg: 'bg-[#1e2a22] border-[#2e4c34]', text: 'text-[#81C995]' },
  PWN: { bg: 'bg-[#1c2834] border-[#28425a]', text: 'text-[#78b3ea]' },
  Web: { bg: 'bg-[#2b271c] border-[#4f4327]', text: 'text-[#fbc02d]' },
  Forensic: { bg: 'bg-[#291e2b] border-[#4a2e50]', text: 'text-[#C28CC3]' },
  Crypto: { bg: 'bg-[#222135] border-[#383561]', text: 'text-[#9c9ef5]' },
  Misc: { bg: 'bg-[#28211e] border-[#4d382d]', text: 'text-[#f09a65]' },
  SysAdmin: { bg: 'bg-[#222222] border-[#383838]', text: 'text-[#cccccc]' },
};

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'alumni'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: '',
    avatar: '',
    joinDate: '',
    github: '',
    linkedin: '',
    ctftime: '',
    blog: false,
  });

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  useEffect(() => {
    const checkAuth = () => {
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setCurrentUser(user);
          setIsAdmin(user.role === 'admin');
        } catch (e) {
          console.error(e);
        }
      }
    };
    checkAuth();
  }, []);

  const loadMembers = async () => {
    setIsLoading(true);
    setError(null);

    const endpoints = [
      '/api/members',
      'http://localhost:5000/api/members',
      'https://ccug.gunadarma.ac.id/api/members',
    ];

    let loaded = false;

    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data: Member[] = await res.json();
          setMembers(data);
          loaded = true;
          break;
        }
      } catch (err) {
        // try next
      }
    }

    if (!loaded) {
      setError('Unable to load roster. Make sure the backend server is running on port 5000.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    document.title = 'Members - Cyber Community Gunadarma';
    loadMembers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsAdmin(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        avatar: formData.avatar,
        joinDate: formData.joinDate,
        github: formData.github,
        linkedin: formData.linkedin,
        ctftime: formData.ctftime,
        blog: formData.blog,
      };

      const endpoint = editingMember
        ? `http://localhost:5000/api/members/${editingMember._id}`
        : 'http://localhost:5000/api/members';

      const res = await fetch(endpoint, {
        method: editingMember ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Action failed');

      setIsModalOpen(false);
      setEditingMember(null);
      setFormData({
        name: '',
        description: '',
        tags: '',
        avatar: '',
        joinDate: '',
        github: '',
        linkedin: '',
        ctftime: '',
        blog: false,
      });
      loadMembers();
    } catch (err: any) {
      alert(err.message || 'Error occurred');
    }
  };

  const handleDelete = async () => {
    if (!deletingMember) return;
    try {
      const res = await fetch(`http://localhost:5000/api/members/${deletingMember._id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Delete failed');
      setIsDeleteModalOpen(false);
      setDeletingMember(null);
      loadMembers();
    } catch (err: any) {
      alert(err.message || 'Error deleting member');
    }
  };

  // Parse joinDate string to timestamp for sorting (earliest/oldest first)
  const parseJoinDate = (dateStr?: string): number => {
    if (!dateStr) return 9999999999999;
    const trimmed = dateStr.trim();
    // Check if format is just year, e.g. "2022"
    if (/^\d{4}$/.test(trimmed)) {
      return new Date(`${trimmed}-01-01`).getTime();
    }
    // Attempt standard parse, e.g. "May 2017", "Oct 2024"
    const parsed = Date.parse(`1 ${trimmed}`);
    if (!isNaN(parsed)) return parsed;
    const directParsed = Date.parse(trimmed);
    if (!isNaN(directParsed)) return directParsed;
    return 9999999999999;
  };

  // Filter & sort logic (ordered by oldest join date first)
  const filtered = members
    .filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (activeTab === 'active') {
        return m.tags.some((t) => t.toLowerCase() === 'active');
      }
      if (activeTab === 'alumni') {
        return m.tags.some((t) => t.toLowerCase() === 'alumni' || t.toLowerCase() === 'founder');
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = parseJoinDate(a.joinDate);
      const dateB = parseJoinDate(b.joinDate);
      if (dateA !== dateB) {
        return dateA - dateB; // Oldest/earliest first
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      {/* Page Title & Intro - HCS style header */}
      <section className="space-y-4">
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Team Members
        </h1>
        <p className="text-[#a3a3a3] font-sans text-base max-w-2xl leading-relaxed">
          Members of Cyber Community Universitas Gunadarma, including active competition players,
          security researchers, and alumni contributors.
        </p>
      </section>

      {/* Control bar: Tabs + Search + Admin Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 pb-6 border-b border-[#262626]">
        {/* Tabs */}
        <div className="flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2 rounded-full transition ${
              activeTab === 'all'
                ? 'bg-white text-black'
                : 'bg-[#141414] border border-[#262626] text-[#a3a3a3] hover:text-white'
            }`}
          >
            All ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-5 py-2 rounded-full transition ${
              activeTab === 'active'
                ? 'bg-white text-black'
                : 'bg-[#141414] border border-[#262626] text-[#a3a3a3] hover:text-white'
            }`}
          >
            Active Roster (
            {members.filter((m) => m.tags.some((t) => t.toLowerCase() === 'active')).length}
            )
          </button>
          <button
            onClick={() => setActiveTab('alumni')}
            className={`px-5 py-2 rounded-full transition ${
              activeTab === 'alumni'
                ? 'bg-white text-black'
                : 'bg-[#141414] border border-[#262626] text-[#a3a3a3] hover:text-white'
            }`}
          >
            Alumni (
            {
              members.filter((m) =>
                m.tags.some((t) => t.toLowerCase() === 'alumni' || t.toLowerCase() === 'founder')
              ).length
            }
            )
          </button>
        </div>

        {/* Search input & Admin buttons */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]" />
            <input
              type="text"
              placeholder="Search member, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#111111] border border-[#262626] rounded-full pl-9 pr-4 py-1.5 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-white transition w-48 sm:w-56"
            />
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingMember(null);
                  setFormData({
                    name: '',
                    description: '',
                    tags: '',
                    avatar: '',
                    joinDate: '',
                    github: '',
                    linkedin: '',
                    ctftime: '',
                    blog: false,
                  });
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-black font-heading text-xs font-bold uppercase rounded-full hover:bg-[#e5e5e5]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
              <button
                onClick={handleLogout}
                className="p-2 border border-[#262626] text-[#a3a3a3] hover:text-white rounded-full"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Table - Exactly like https://hcs-team.com/members/ */}
      <section>
        <div className="overflow-hidden rounded-2xl border border-[#262626] bg-[#0c0c0c]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-[#262626] bg-[#141414] font-heading text-xs text-[#a3a3a3] uppercase tracking-wider">
                  <th scope="col" className="px-6 py-4">
                    Nickname
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Expertise
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Join Date
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Social
                  </th>
                  {isAdmin && (
                    <th scope="col" className="px-6 py-4 text-right">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {isLoading ? (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="px-6 py-16 text-center font-mono text-xs text-[#737373]">
                      Loading team members...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center text-sm text-[#ef4444]">
                      {error}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="px-6 py-16 text-center font-mono text-xs text-[#737373]">
                      No members found matching your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((member) => (
                    <tr
                      key={member._id}
                      className="hover:bg-[#121212] transition-colors"
                    >
                      {/* Nickname & Avatar */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <img
                            src={
                              member.avatar ||
                              'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg'
                            }
                            alt={`${member.name}'s profile`}
                            className="aspect-square rounded-full w-12 h-12 object-cover border border-[#2e2e2e]"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-heading text-lg font-bold text-white tracking-tight leading-snug">
                                {member.name}
                              </h3>
                              {member.tags.some((t) => t.toLowerCase() === 'active') ? (
                                <span className="w-2 h-2 rounded-full bg-emerald-400" title="Active Competitor" />
                              ) : (
                                <span className="font-mono text-[9px] text-[#737373] border border-[#282828] px-1.5 py-0.2 rounded">
                                  Alumni
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#737373] font-sans line-clamp-1 max-w-xs">
                              {member.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Expertise Badges */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {member.tags
                            .filter(
                              (t) =>
                                t.toLowerCase() !== 'active' &&
                                t.toLowerCase() !== 'alumni' &&
                                t.toLowerCase() !== 'founder'
                            )
                            .map((tag) => {
                              const style = EXPERTISE_COLORS[tag] || {
                                bg: 'bg-[#181818] border-[#2e2e2e]',
                                text: 'text-[#cccccc]',
                              };
                              return (
                                <span
                                  key={tag}
                                  className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-mono font-medium border ${style.bg} ${style.text}`}
                                >
                                  {tag}
                                </span>
                              );
                            })}
                        </div>
                      </td>

                      {/* Join Date */}
                      <td className="px-6 py-4 whitespace-nowrap font-sans text-xs text-[#a3a3a3]">
                        {member.joinDate || 'May 2017'}
                      </td>

                      {/* Social Icons */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {member.github ? (
                            <a
                              href={member.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#a3a3a3] hover:text-white transition"
                              title="GitHub Profile"
                            >
                              <Github className="w-4 h-4" />
                            </a>
                          ) : (
                            <a
                              href="https://github.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#555555] hover:text-white transition"
                              title="GitHub"
                            >
                              <Github className="w-4 h-4" />
                            </a>
                          )}

                          {member.linkedin ? (
                            <a
                              href={member.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#a3a3a3] hover:text-white transition"
                              title="LinkedIn Profile"
                            >
                              <Linkedin className="w-4 h-4" />
                            </a>
                          ) : (
                            <a
                              href="https://linkedin.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#555555] hover:text-white transition"
                              title="LinkedIn"
                            >
                              <Linkedin className="w-4 h-4" />
                            </a>
                          )}

                          <a
                            href={member.ctftime || 'https://ctftime.org'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#a3a3a3] hover:text-white transition font-mono text-[10px] border border-[#2e2e2e] px-1.5 py-0.5 rounded"
                            title="CTFtime Profile"
                          >
                            CTF
                          </a>
                        </div>
                      </td>

                      {/* Admin Actions */}
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingMember(member);
                                setFormData({
                                  name: member.name,
                                  description: member.description,
                                  tags: member.tags.join(', '),
                                  avatar: member.avatar || '',
                                  joinDate: member.joinDate || '',
                                  github: member.github || '',
                                  linkedin: member.linkedin || '',
                                  ctftime: member.ctftime || '',
                                  blog: member.blog,
                                });
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 text-[#a3a3a3] hover:text-white rounded-full transition"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingMember(member);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-1.5 text-[#a3a3a3] hover:text-white rounded-full transition"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Modal Add / Edit Member */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#141414] border border-[#262626] rounded-2xl w-full max-w-lg p-6 space-y-5 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
              <span className="font-heading font-bold text-base text-white uppercase">
                {editingMember ? 'Edit Member' : 'Add Member'}
              </span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#a3a3a3] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#737373] uppercase">Nickname / Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg p-2 text-white font-sans text-xs focus:outline-none focus:border-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[#737373] uppercase">Join Date (e.g. Sep 2024)</label>
                  <input
                    type="text"
                    value={formData.joinDate}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg p-2 text-white font-sans text-xs focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#737373] uppercase">Bio / Tagline</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg p-2 text-white font-sans text-xs focus:outline-none focus:border-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#737373] uppercase">Expertise Tags (Active, Reverse, PWN, Web, Forensic, Crypto, Misc, Alumni)</label>
                <input
                  type="text"
                  placeholder="Active, Reverse, PWN, Crypto"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg p-2 text-white font-sans text-xs focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[#737373] uppercase">GitHub URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg p-2 text-white font-sans text-xs focus:outline-none focus:border-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[#737373] uppercase">LinkedIn URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg p-2 text-white font-sans text-xs focus:outline-none focus:border-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[#737373] uppercase">CTFtime URL</label>
                  <input
                    type="url"
                    placeholder="https://ctftime.org/user/..."
                    value={formData.ctftime}
                    onChange={(e) => setFormData({ ...formData, ctftime: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg p-2 text-white font-sans text-xs focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#737373] uppercase">Avatar Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg p-2 text-white font-sans text-xs focus:outline-none focus:border-white"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 border border-[#262626] rounded-full text-[#a3a3a3] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-white text-black font-bold uppercase rounded-full hover:bg-[#e5e5e5]"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#141414] border border-[#262626] rounded-2xl w-full max-w-sm p-6 space-y-4 font-mono text-xs">
            <div className="font-heading font-bold text-base text-white uppercase">Confirm Deletion</div>
            <p className="text-[#a3a3a3] font-sans text-sm">
              Delete member <strong>{deletingMember?.name}</strong>?
            </p>
            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-[#262626] rounded-full text-[#a3a3a3] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 bg-white text-black font-bold uppercase rounded-full hover:bg-[#e5e5e5]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
