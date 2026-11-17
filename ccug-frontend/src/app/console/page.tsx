'use client';

import React, { useEffect, useState } from 'react';
import {
  Shield,
  Lock,
  User,
  Users,
  BookOpen,
  Trophy,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  LogOut,
  Search,
  Check,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  Github,
  Linkedin,
  Flag,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

type UserType = {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
};

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
  createdAt?: string;
};

type Post = {
  _id: string;
  title: string;
  category: string;
  author: string;
  date: string;
  description: string;
  url: string;
};

type Contest = {
  _id: string;
  place: string | number;
  event: string;
  year: number;
  rating?: number;
  ctfPoints?: number;
};

const COMMON_TAGS = [
  'Active',
  'Alumni',
  'Founder',
  'Leader',
  'Reverse',
  'PWN',
  'Web',
  'Crypto',
  'Forensic',
  'Misc',
];

export default function AdminConsolePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Tab: 'members' | 'posts' | 'contests'
  const [activeTab, setActiveTab] = useState<'members' | 'posts' | 'contests'>('members');

  // Data States
  const [members, setMembers] = useState<Member[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Member Filter State
  const [memberFilterType, setMemberFilterType] = useState<'all' | 'active' | 'alumni' | 'founder'>('all');
  const [memberSearch, setMemberSearch] = useState('');

  // Modals
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberFormData, setMemberFormData] = useState({
    name: '',
    description: '',
    tags: [] as string[],
    customTag: '',
    avatar: '',
    joinDate: '',
    github: '',
    linkedin: '',
    ctftime: '',
    blog: false,
  });

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [postFormData, setPostFormData] = useState({
    title: '',
    category: '',
    author: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    url: '',
  });

  const [isContestModalOpen, setIsContestModalOpen] = useState(false);
  const [editingContest, setEditingContest] = useState<Contest | null>(null);
  const [contestFormData, setContestFormData] = useState({
    place: 'Finalist',
    event: '',
    year: new Date().getFullYear(),
    rating: 0,
    ctfPoints: 0,
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'member' | 'post' | 'contest';
    id: string;
    title: string;
  } | null>(null);

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  // Check auth status on load
  useEffect(() => {
    document.title = 'CONSOLE // CCUG';
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (!token || !userStr) {
        setIsCheckingAuth(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const userData = await res.json();
          if (userData.role === 'admin') {
            setCurrentUser(userData);
            setIsAuthenticated(true);
          } else {
            handleLogout();
          }
        } else {
          handleLogout();
        }
      } catch (err) {
        // Fallback to cached user if offline or network issue
        try {
          const user = JSON.parse(userStr);
          if (user.role === 'admin') {
            setCurrentUser(user);
            setIsAuthenticated(true);
          }
        } catch {
          handleLogout();
        }
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkToken();
  }, []);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const loadAllData = async () => {
    setIsLoadingData(true);
    try {
      const [membersRes, postsRes, contestsRes] = await Promise.all([
        fetch('/api/members').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/posts').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/contests?limit=200').then((r) => (r.ok ? r.json() : [])),
      ]);
      setMembers(membersRes);
      setPosts(postsRes);
      setContests(contestsRes);
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier,
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.user.role !== 'admin') {
        throw new Error('Access denied. Administrator privileges required.');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setCurrentUser(data.user);
      setIsAuthenticated(true);
    } catch (err: any) {
      setLoginError(err.message || 'Authentication error');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  // =================== MEMBER ACTIONS ===================
  const openAddMemberModal = () => {
    setEditingMember(null);
    setMemberFormData({
      name: '',
      description: '',
      tags: ['Active'],
      customTag: '',
      avatar: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg',
      joinDate: 'Oct 2024',
      github: '',
      linkedin: '',
      ctftime: '',
      blog: false,
    });
    setIsMemberModalOpen(true);
  };

  const openEditMemberModal = (member: Member) => {
    setEditingMember(member);
    setMemberFormData({
      name: member.name,
      description: member.description,
      tags: member.tags || [],
      customTag: '',
      avatar: member.avatar || '',
      joinDate: member.joinDate || '',
      github: member.github || '',
      linkedin: member.linkedin || '',
      ctftime: member.ctftime || '',
      blog: member.blog || false,
    });
    setIsMemberModalOpen(true);
  };

  const toggleTag = (tag: string) => {
    if (memberFormData.tags.includes(tag)) {
      setMemberFormData({
        ...memberFormData,
        tags: memberFormData.tags.filter((t) => t !== tag),
      });
    } else {
      setMemberFormData({
        ...memberFormData,
        tags: [...memberFormData.tags, tag],
      });
    }
  };

  const addCustomTag = () => {
    const trimmed = memberFormData.customTag.trim();
    if (trimmed && !memberFormData.tags.includes(trimmed)) {
      setMemberFormData({
        ...memberFormData,
        tags: [...memberFormData.tags, trimmed],
        customTag: '',
      });
    }
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: memberFormData.name,
        description: memberFormData.description,
        tags: memberFormData.tags,
        avatar: memberFormData.avatar,
        joinDate: memberFormData.joinDate,
        github: memberFormData.github,
        linkedin: memberFormData.linkedin,
        ctftime: memberFormData.ctftime,
        blog: memberFormData.blog,
      };

      const url = editingMember
        ? `/api/members/${editingMember._id}`
        : '/api/members';

      const res = await fetch(url, {
        method: editingMember ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to save member');
      }

      setIsMemberModalOpen(false);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Error occurred');
    }
  };

  // =================== POST ACTIONS ===================
  const openAddPostModal = () => {
    setEditingPost(null);
    setPostFormData({
      title: '',
      category: 'Web Exploitation',
      author: currentUser?.username || 'CCUG',
      date: new Date().toISOString().split('T')[0],
      description: '',
      url: '',
    });
    setIsPostModalOpen(true);
  };

  const openEditPostModal = (post: Post) => {
    setEditingPost(post);
    setPostFormData({
      title: post.title,
      category: post.category,
      author: post.author,
      date: post.date ? new Date(post.date).toISOString().split('T')[0] : '',
      description: post.description || '',
      url: post.url || '',
    });
    setIsPostModalOpen(true);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPost ? `/api/posts/${editingPost._id}` : '/api/posts';

      const res = await fetch(url, {
        method: editingPost ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(postFormData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to save post');
      }

      setIsPostModalOpen(false);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Error occurred');
    }
  };

  // =================== CONTEST ACTIONS ===================
  const openAddContestModal = () => {
    setEditingContest(null);
    setContestFormData({
      place: 'Finalist',
      event: '',
      year: new Date().getFullYear(),
      rating: 0,
      ctfPoints: 0,
    });
    setIsContestModalOpen(true);
  };

  const openEditContestModal = (contest: Contest) => {
    setEditingContest(contest);
    setContestFormData({
      place: String(contest.place),
      event: contest.event,
      year: contest.year,
      rating: contest.rating || 0,
      ctfPoints: contest.ctfPoints || 0,
    });
    setIsContestModalOpen(true);
  };

  const handleSaveContest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingContest
        ? `/api/contests/${editingContest._id}`
        : '/api/contests';

      const res = await fetch(url, {
        method: editingContest ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(contestFormData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to save contest');
      }

      setIsContestModalOpen(false);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Error occurred');
    }
  };

  // =================== DELETE ACTION ===================
  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const endpointMap = {
        member: `/api/members/${deleteConfirm.id}`,
        post: `/api/posts/${deleteConfirm.id}`,
        contest: `/api/contests/${deleteConfirm.id}`,
      };

      const res = await fetch(endpointMap[deleteConfirm.type], {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error('Delete action failed');

      setDeleteConfirm(null);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Error occurred');
    }
  };

  // Filter members
  const filteredMembers = members.filter((m) => {
    const query = memberSearch.toLowerCase();
    const matchesSearch =
      m.name.toLowerCase().includes(query) ||
      m.description.toLowerCase().includes(query) ||
      (m.tags && m.tags.some((t) => t.toLowerCase().includes(query)));

    if (!matchesSearch) return false;

    if (memberFilterType === 'active') {
      return m.tags && m.tags.some((t) => t.toLowerCase() === 'active');
    }
    if (memberFilterType === 'alumni') {
      return m.tags && m.tags.some((t) => t.toLowerCase() === 'alumni');
    }
    if (memberFilterType === 'founder') {
      return m.tags && m.tags.some((t) => t.toLowerCase() === 'founder');
    }
    return true;
  });

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono text-sm text-[#737373]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>Verifying credentials...</span>
        </div>
      </div>
    );
  }

  // =================== UNAUTHENTICATED: LOGIN VIEW ===================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black bg-grid-pattern flex flex-col justify-center items-center px-6 py-12 relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-white/[0.03] blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md bg-[#0c0c0c] border border-[#262626] rounded-3xl p-8 sm:p-10 space-y-8 relative z-10 shadow-2xl">
          <div className="space-y-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#141414] border border-[#333333] flex items-center justify-center mx-auto text-white shadow-inner">
              <Shield className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div className="space-y-1">
              <h1 className="font-heading text-2xl font-extrabold tracking-tight text-white">
                CCUG Command Console
              </h1>
              <p className="font-mono text-xs text-[#737373]">
                Restricted administrative access portal
              </p>
            </div>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs flex items-center gap-2.5 font-sans">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="block font-mono text-xs text-[#a3a3a3] uppercase tracking-wider">
                Username or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="admin or user@gunadarma.ac.id"
                  className="w-full bg-[#141414] border border-[#262626] focus:border-white rounded-xl px-4 py-3 text-sm text-white placeholder-[#525252] outline-none transition font-sans"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-mono text-xs text-[#a3a3a3] uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#141414] border border-[#262626] focus:border-white rounded-xl px-4 py-3 text-sm text-white placeholder-[#525252] outline-none transition font-sans pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 bg-white hover:bg-[#e5e5e5] text-black font-heading text-sm font-bold rounded-xl transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-white/10"
            >
              {loginLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[#1f1f1f] flex items-center justify-between font-mono text-[11px] text-[#525252]">
            <span>Cyber Community UG</span>
            <Link href="/" className="hover:text-white transition">
              ← Return to site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =================== AUTHENTICATED: ADMIN CONSOLE ===================
  return (
    <div className="min-h-screen bg-black text-white pb-28">
      {/* Top Console Navigation Bar */}
      <header className="border-b border-[#262626] bg-[#0c0c0c]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs">
              CC
            </div>
            <div>
              <span className="font-heading font-extrabold text-sm tracking-tight text-white flex items-center gap-2">
                <span>CCUG Command Console</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#1f1f1f] text-[#a3a3a3] border border-[#333333]">
                  ADMIN
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="font-mono text-xs text-[#a3a3a3] hover:text-white transition flex items-center gap-1.5"
            >
              <span>View Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <div className="h-4 w-px bg-[#262626]" />

            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[#737373] hidden sm:inline">
                {currentUser?.username || currentUser?.email}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 font-mono text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-950 hover:bg-red-950/40 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Console Container */}
      <main className="max-w-7xl mx-auto px-6 pt-10 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262626] pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('members')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-heading text-xs font-bold uppercase tracking-wider transition ${
                activeTab === 'members'
                  ? 'bg-white text-black'
                  : 'text-[#a3a3a3] hover:text-white bg-[#141414] border border-[#262626]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Members ({members.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('posts')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-heading text-xs font-bold uppercase tracking-wider transition ${
                activeTab === 'posts'
                  ? 'bg-white text-black'
                  : 'text-[#a3a3a3] hover:text-white bg-[#141414] border border-[#262626]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Writeups & Blog ({posts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('contests')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-heading text-xs font-bold uppercase tracking-wider transition ${
                activeTab === 'contests'
                  ? 'bg-white text-black'
                  : 'text-[#a3a3a3] hover:text-white bg-[#141414] border border-[#262626]'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Contests ({contests.length})</span>
            </button>
          </div>

          <div>
            {activeTab === 'members' && (
              <button
                onClick={openAddMemberModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl font-heading text-xs font-bold uppercase tracking-wider hover:bg-[#e5e5e5] transition shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Member</span>
              </button>
            )}
            {activeTab === 'posts' && (
              <button
                onClick={openAddPostModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl font-heading text-xs font-bold uppercase tracking-wider hover:bg-[#e5e5e5] transition shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>New Writeup</span>
              </button>
            )}
            {activeTab === 'contests' && (
              <button
                onClick={openAddContestModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl font-heading text-xs font-bold uppercase tracking-wider hover:bg-[#e5e5e5] transition shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Record</span>
              </button>
            )}
          </div>
        </div>

        {/* ===================== TAB 1: MEMBERS ===================== */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setMemberFilterType('all')}
                  className={`px-3.5 py-1.5 rounded-lg font-mono text-xs border transition ${
                    memberFilterType === 'all'
                      ? 'bg-white text-black border-white'
                      : 'border-[#262626] text-[#737373] hover:text-white bg-[#0c0c0c]'
                  }`}
                >
                  All ({members.length})
                </button>
                <button
                  onClick={() => setMemberFilterType('active')}
                  className={`px-3.5 py-1.5 rounded-lg font-mono text-xs border transition ${
                    memberFilterType === 'active'
                      ? 'bg-white text-black border-white'
                      : 'border-[#262626] text-[#737373] hover:text-white bg-[#0c0c0c]'
                  }`}
                >
                  Active Roster ({members.filter((m) => m.tags?.some((t) => t.toLowerCase() === 'active')).length})
                </button>
                <button
                  onClick={() => setMemberFilterType('alumni')}
                  className={`px-3.5 py-1.5 rounded-lg font-mono text-xs border transition ${
                    memberFilterType === 'alumni'
                      ? 'bg-white text-black border-white'
                      : 'border-[#262626] text-[#737373] hover:text-white bg-[#0c0c0c]'
                  }`}
                >
                  Alumni ({members.filter((m) => m.tags?.some((t) => t.toLowerCase() === 'alumni')).length})
                </button>
                <button
                  onClick={() => setMemberFilterType('founder')}
                  className={`px-3.5 py-1.5 rounded-lg font-mono text-xs border transition ${
                    memberFilterType === 'founder'
                      ? 'bg-white text-black border-white'
                      : 'border-[#262626] text-[#737373] hover:text-white bg-[#0c0c0c]'
                  }`}
                >
                  Founders ({members.filter((m) => m.tags?.some((t) => t.toLowerCase() === 'founder')).length})
                </button>
              </div>

              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#525252]" />
                <input
                  type="text"
                  placeholder="Filter name, tag, role..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full bg-[#0c0c0c] border border-[#262626] focus:border-white rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#525252] outline-none transition font-sans"
                />
              </div>
            </div>

            {/* Members Table */}
            <div className="border border-[#262626] rounded-2xl bg-[#0c0c0c] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-[#141414] border-b border-[#262626] font-mono text-[11px] text-[#737373] uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Member</th>
                      <th className="px-5 py-3.5">Status / Tags</th>
                      <th className="px-5 py-3.5">Joined</th>
                      <th className="px-5 py-3.5">Links</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f1f1f]">
                    {filteredMembers.map((m) => (
                      <tr key={m._id} className="hover:bg-[#121212] transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={m.avatar || 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg'}
                              alt={m.name}
                              className="w-9 h-9 rounded-full object-cover border border-[#262626] bg-[#1a1a1a]"
                              onError={(e) => {
                                (e.target as any).src = 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg';
                              }}
                            />
                            <div>
                              <div className="font-heading font-bold text-sm text-white">
                                {m.name}
                              </div>
                              <div className="text-[11px] text-[#737373] max-w-xs truncate">
                                {m.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1.5 max-w-sm">
                            {m.tags &&
                              m.tags.map((tag, idx) => {
                                const isStatus = ['active', 'alumni', 'founder'].includes(tag.toLowerCase());
                                return (
                                  <span
                                    key={idx}
                                    className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                                      isStatus
                                        ? tag.toLowerCase() === 'active'
                                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                                          : tag.toLowerCase() === 'founder'
                                          ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                                          : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                                        : 'bg-[#141414] text-[#a3a3a3] border-[#262626]'
                                    }`}
                                  >
                                    {tag}
                                  </span>
                                );
                              })}
                          </div>
                        </td>
                        <td className="px-5 py-4 font-mono text-[11px] text-[#a3a3a3]">
                          {m.joinDate || '—'}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-[#737373]">
                            {m.linkedin && (
                              <a
                                href={m.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-400 transition"
                                title="LinkedIn"
                              >
                                <Linkedin className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {m.github && (
                              <a
                                href={m.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white transition"
                                title="GitHub"
                              >
                                <Github className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {m.ctftime && (
                              <a
                                href={m.ctftime}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-amber-400 transition"
                                title="CTFtime"
                              >
                                <Flag className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {!m.linkedin && !m.github && !m.ctftime && <span className="text-[#3a3a3a]">—</span>}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => openEditMemberModal(m)}
                              className="p-1.5 rounded-lg border border-[#262626] hover:border-white text-[#a3a3a3] hover:text-white transition"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  type: 'member',
                                  id: m._id,
                                  title: m.name,
                                })
                              }
                              className="p-1.5 rounded-lg border border-red-950/60 hover:border-red-500 text-red-400 hover:text-red-200 hover:bg-red-950/30 transition"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: POSTS / WRITEUPS ===================== */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            <div className="border border-[#262626] rounded-2xl bg-[#0c0c0c] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-[#141414] border-b border-[#262626] font-mono text-[11px] text-[#737373] uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Title</th>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5">Author</th>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-5 py-3.5">Link</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f1f1f]">
                    {posts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center font-mono text-xs text-[#525252]">
                          — NO WRITEUPS OR BLOG POSTS PUBLISHED YET —
                        </td>
                      </tr>
                    ) : (
                      posts.map((p) => (
                        <tr key={p._id} className="hover:bg-[#121212] transition">
                          <td className="px-5 py-4">
                            <div className="font-heading font-bold text-sm text-white">{p.title}</div>
                            {p.description && (
                              <div className="text-[11px] text-[#737373] max-w-md truncate">{p.description}</div>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#1f1f1f] border border-[#333333] text-[#a3a3a3]">
                              {p.category}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-mono text-white">{p.author}</td>
                          <td className="px-5 py-4 font-mono text-[11px] text-[#737373]">
                            {p.date ? new Date(p.date).toISOString().split('T')[0] : '—'}
                          </td>
                          <td className="px-5 py-4">
                            {p.url ? (
                              <a
                                href={p.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#a3a3a3] hover:text-white transition flex items-center gap-1 font-mono text-[11px]"
                              >
                                <span>Open</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-[#3a3a3a] font-mono">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => openEditPostModal(p)}
                                className="p-1.5 rounded-lg border border-[#262626] hover:border-white text-[#a3a3a3] hover:text-white transition"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    type: 'post',
                                    id: p._id,
                                    title: p.title,
                                  })
                                }
                                className="p-1.5 rounded-lg border border-red-950/60 hover:border-red-500 text-red-400 hover:text-red-200 hover:bg-red-950/30 transition"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 3: CONTESTS ===================== */}
        {activeTab === 'contests' && (
          <div className="space-y-6">
            <div className="border border-[#262626] rounded-2xl bg-[#0c0c0c] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-[#141414] border-b border-[#262626] font-mono text-[11px] text-[#737373] uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Placement</th>
                      <th className="px-5 py-3.5">Event Title</th>
                      <th className="px-5 py-3.5">Year</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f1f1f]">
                    {contests.map((c) => (
                      <tr key={c._id} className="hover:bg-[#121212] transition">
                        <td className="px-5 py-4 font-mono font-bold text-white">
                          <span className="text-[#525252] mr-1.5">/</span>
                          {c.place === 0 ? 'Finalist' : c.place === 1 ? '1st Place' : c.place === 2 ? '2nd Place' : c.place === 3 ? '3rd Place' : `${c.place}th Place`}
                        </td>
                        <td className="px-5 py-4 font-heading font-bold text-sm text-white">
                          {c.event}
                        </td>
                        <td className="px-5 py-4 font-mono text-[#a3a3a3]">{c.year}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => openEditContestModal(c)}
                              className="p-1.5 rounded-lg border border-[#262626] hover:border-white text-[#a3a3a3] hover:text-white transition"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  type: 'contest',
                                  id: c._id,
                                  title: `${c.event} (${c.year})`,
                                })
                              }
                              className="p-1.5 rounded-lg border border-red-950/60 hover:border-red-500 text-red-400 hover:text-red-200 hover:bg-red-950/30 transition"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ===================== MODAL: MEMBER ADD/EDIT ===================== */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-[#0c0c0c] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#262626]">
              <h3 className="font-heading text-lg font-bold text-white">
                {editingMember ? 'Edit Member Roster' : 'Add New Member to Roster'}
              </h3>
              <button
                onClick={() => setIsMemberModalOpen(false)}
                className="text-[#737373] hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-xs text-[#a3a3a3] uppercase">Handle / Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. tiramisaks"
                    value={memberFormData.name}
                    onChange={(e) => setMemberFormData({ ...memberFormData, name: e.target.value })}
                    className="w-full bg-[#141414] border border-[#262626] focus:border-white rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-xs text-[#a3a3a3] uppercase">Join Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Oct 2024 or May 2017"
                    value={memberFormData.joinDate}
                    onChange={(e) => setMemberFormData({ ...memberFormData, joinDate: e.target.value })}
                    className="w-full bg-[#141414] border border-[#262626] focus:border-white rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-xs text-[#a3a3a3] uppercase">Description / Specialization *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reverse Engineering • Binary Exploitation • Cryptography"
                  value={memberFormData.description}
                  onChange={(e) => setMemberFormData({ ...memberFormData, description: e.target.value })}
                  className="w-full bg-[#141414] border border-[#262626] focus:border-white rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-sans"
                />
              </div>

              {/* Tag Selector */}
              <div className="space-y-2 pt-1">
                <label className="font-mono text-xs text-[#a3a3a3] uppercase block">Tags & Status</label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_TAGS.map((tag) => {
                    const isSelected = memberFormData.tags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`font-mono text-[11px] px-3 py-1 rounded-lg border transition ${
                          isSelected
                            ? 'bg-white text-black border-white font-bold'
                            : 'bg-[#141414] text-[#737373] hover:text-white border-[#262626]'
                        }`}
                      >
                        {tag} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add custom tag..."
                    value={memberFormData.customTag}
                    onChange={(e) => setMemberFormData({ ...memberFormData, customTag: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomTag();
                      }
                    }}
                    className="bg-[#141414] border border-[#262626] focus:border-white rounded-xl px-3 py-1.5 text-xs text-white outline-none font-sans flex-1"
                  />
                  <button
                    type="button"
                    onClick={addCustomTag}
                    className="px-3 py-1.5 bg-[#262626] hover:bg-[#383838] text-white rounded-xl text-xs font-mono"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="font-mono text-[11px] text-[#737373]">LinkedIn URL</label>
                  <input
                    type="text"
                    placeholder="https://linkedin.com/in/..."
                    value={memberFormData.linkedin}
                    onChange={(e) => setMemberFormData({ ...memberFormData, linkedin: e.target.value })}
                    className="w-full bg-[#141414] border border-[#262626] focus:border-white rounded-xl px-3 py-2 text-xs text-white outline-none font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[11px] text-[#737373]">GitHub URL</label>
                  <input
                    type="text"
                    placeholder="https://github.com/..."
                    value={memberFormData.github}
                    onChange={(e) => setMemberFormData({ ...memberFormData, github: e.target.value })}
                    className="w-full bg-[#141414] border border-[#262626] focus:border-white rounded-xl px-3 py-2 text-xs text-white outline-none font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[11px] text-[#737373]">CTFtime URL</label>
                  <input
                    type="text"
                    placeholder="https://ctftime.org/..."
                    value={memberFormData.ctftime}
                    onChange={(e) => setMemberFormData({ ...memberFormData, ctftime: e.target.value })}
                    className="w-full bg-[#141414] border border-[#262626] focus:border-white rounded-xl px-3 py-2 text-xs text-white outline-none font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="font-mono text-xs text-[#a3a3a3] uppercase">Avatar / Profile Picture URL</label>
                <input
                  type="text"
                  placeholder="https://... or /img/..."
                  value={memberFormData.avatar}
                  onChange={(e) => setMemberFormData({ ...memberFormData, avatar: e.target.value })}
                  className="w-full bg-[#141414] border border-[#262626] focus:border-white rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-sans"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="hasBlog"
                  checked={memberFormData.blog}
                  onChange={(e) => setMemberFormData({ ...memberFormData, blog: e.target.checked })}
                  className="rounded border-[#262626] bg-[#141414] text-white focus:ring-0"
                />
                <label htmlFor="hasBlog" className="font-mono text-xs text-[#a3a3a3] cursor-pointer">
                  Author writes blogs / CTF challenge writeups
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#262626] text-[#a3a3a3] hover:text-white transition font-mono text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-white text-black font-heading text-xs font-bold uppercase rounded-xl hover:bg-[#e5e5e5] transition"
                >
                  {editingMember ? 'Save Changes' : 'Create Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: POST ADD/EDIT ===================== */}
      {isPostModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-[#0c0c0c] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#262626]">
              <h3 className="font-heading text-lg font-bold text-white">
                {editingPost ? 'Edit Blog / Writeup' : 'Publish New Blog / Writeup'}
              </h3>
              <button onClick={() => setIsPostModalOpen(false)} className="text-[#737373] hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-mono text-xs text-[#a3a3a3] uppercase">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. POLRICTF 2026: Fastbin Dup to RCE"
                  value={postFormData.title}
                  onChange={(e) => setPostFormData({ ...postFormData, title: e.target.value })}
                  className="w-full bg-[#141414] border border-[#262626] focus:border-white rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-xs text-[#a3a3a3] uppercase">Category *</label>
                  <select
                    value={postFormData.category}
                    onChange={(e) => setPostFormData({ ...postFormData, category: e.target.value })}
                    className="w-full bg-[#141414] border border-[#262626] focus:border-white rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-sans"
                  >
                    <option value="Web Exploitation">Web Exploitation</option>
                    <option value="Reverse Engineering">Reverse Engineering</option>
                    <option value="Binary Exploitation">Binary Exploitation (PWN)</option>
                    <option value="Cryptography">Cryptography</option>
                    <option value="Digital Forensics">Digital Forensics</option>
                    <option value="General & Security Insights">General & Security Insights</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-xs text-[#a3a3a3] uppercase">Author *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. tiramisaks"
                    value={postFormData.author}
                    onChange={(e) => setPostFormData({ ...postFormData, author: e.target.value })}
                    className="w-full bg-[#141414] border border-[#262626] focus:border-white rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-xs text-[#a3a3a3] uppercase">Publication Date</label>
                  <input
                    type="date"
                    value={postFormData.date}
                    onChange={(e) => setPostFormData({ ...postFormData, date: e.target.value })}
                    className="w-full bg-[#141414] border border-[#262626] focus:border-white rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-xs text-[#a3a3a3] uppercase">Writeup Link / External URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={postFormData.url}
                    onChange={(e) => setPostFormData({ ...postFormData, url: e.target.value })}
                    className="w-full bg-[#141414] border border-[#262626] focus:border-white rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-xs text-[#a3a3a3] uppercase">Description / Abstract</label>
                <textarea
                  rows={4}
                  placeholder="Summary or detailed explanation of the vulnerability and attack vector..."
                  value={postFormData.description}
                  onChange={(e) => setPostFormData({ ...postFormData, description: e.target.value })}
                  className="w-full bg-[#141414] border border-[#262626] focus:border-white rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-sans resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#262626] text-[#a3a3a3] hover:text-white transition font-mono text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-white text-black font-heading text-xs font-bold uppercase rounded-xl hover:bg-[#e5e5e5] transition"
                >
                  {editingPost ? 'Update Post' : 'Publish Writeup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: CONTEST ADD/EDIT ===================== */}
      {isContestModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0c0c0c] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#262626]">
              <h3 className="font-heading text-lg font-bold text-white">
                {editingContest ? 'Edit Contest Record' : 'Add Tournament Achievement'}
              </h3>
              <button
                onClick={() => setIsContestModalOpen(false)}
                className="text-[#737373] hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContest} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-mono text-xs text-[#a3a3a3] uppercase">Event Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. POLRICTF 2026"
                  value={contestFormData.event}
                  onChange={(e) => setContestFormData({ ...contestFormData, event: e.target.value })}
                  className="w-full bg-[#141414] border border-[#262626] focus:border-white rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-xs text-[#a3a3a3] uppercase">Placement *</label>
                  <input
                    type="text"
                    required
                    placeholder="3rd Place or Finalist"
                    value={contestFormData.place}
                    onChange={(e) => setContestFormData({ ...contestFormData, place: e.target.value })}
                    className="w-full bg-[#141414] border border-[#262626] focus:border-white rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-xs text-[#a3a3a3] uppercase">Year *</label>
                  <input
                    type="number"
                    required
                    value={contestFormData.year}
                    onChange={(e) => setContestFormData({ ...contestFormData, year: parseInt(e.target.value) || 2026 })}
                    className="w-full bg-[#141414] border border-[#262626] focus:border-white rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-sans"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setIsContestModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#262626] text-[#a3a3a3] hover:text-white transition font-mono text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-white text-black font-heading text-xs font-bold uppercase rounded-xl hover:bg-[#e5e5e5] transition"
                >
                  {editingContest ? 'Save Record' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== CONFIRM DELETE MODAL ===================== */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0c0c0c] border border-red-900/60 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-red-950/50 border border-red-800/60 flex items-center justify-center text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-base font-bold text-white">Confirm Deletion</h3>
              <p className="text-xs text-[#a3a3a3] font-sans leading-relaxed">
                Are you sure you want to delete{' '}
                <strong className="text-white">"{deleteConfirm.title}"</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl border border-[#262626] text-xs font-mono text-[#a3a3a3] hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-heading font-bold uppercase rounded-xl transition"
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
