'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Edit2, Trash2, X, LogOut, ExternalLink, ArrowRight, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Post = {
  _id: string;
  title: string;
  category: string;
  author: string;
  date: string;
  description: string;
  url: string;
};

type UserType = {
  username: string;
  role: 'admin' | 'user';
};

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingPost, setDeletingPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    author: '',
    date: '',
    description: '',
    url: '',
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

  const loadPosts = async () => {
    setIsLoading(true);
    setError(null);

    const endpoints = [
      '/api/posts',
      'http://localhost:5000/api/posts',
      'https://ccug.gunadarma.ac.id/api/posts',
    ];

    let loaded = false;
    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data: Post[] = await res.json();
          setPosts(data);
          loaded = true;
          break;
        }
      } catch (err) {
        // try next
      }
    }

    if (!loaded) {
      setError('Unable to load blog posts. Backend must be running on port 5000.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    document.title = 'BLOG & WRITEUPS // CCUG';
    loadPosts();
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
        title: formData.title,
        category: formData.category,
        author: formData.author,
        date: formData.date || new Date().toISOString().split('T')[0],
        description: formData.description,
        url: formData.url,
      };

      const endpoint = editingPost
        ? `http://localhost:5000/api/posts/${editingPost._id}`
        : 'http://localhost:5000/api/posts';

      const res = await fetch(endpoint, {
        method: editingPost ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Action failed');

      setIsModalOpen(false);
      setEditingPost(null);
      setFormData({ title: '', category: '', author: '', date: '', description: '', url: '' });
      loadPosts();
    } catch (err: any) {
      alert(err.message || 'Error saving post');
    }
  };

  const handleDelete = async () => {
    if (!deletingPost) return;
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${deletingPost._id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Delete failed');
      setIsDeleteModalOpen(false);
      setDeletingPost(null);
      loadPosts();
    } catch (err: any) {
      alert(err.message || 'Error deleting post');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-borderline">
        <div className="space-y-2">
          <div className="font-mono text-xs text-muted uppercase tracking-wider">
            TECHNICAL WRITEUPS & RESEARCH
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white uppercase">
            COMMUNITY BLOG
          </h1>
          <p className="text-secondary text-sm font-sans max-w-xl">
            Articles, competition challenge writeups, exploit explanations, and security insights
            authored by CCUG members.
          </p>
        </div>

        {/* Action Header */}
        <div className="flex items-center gap-3 font-mono text-xs">
          {isAdmin ? (
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 border border-borderline bg-surface text-white rounded-full">
                ADMIN: {currentUser?.username}
              </span>
              <button
                onClick={() => {
                  setEditingPost(null);
                  setFormData({ title: '', category: '', author: '', date: '', description: '', url: '' });
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black font-bold uppercase rounded-full hover:bg-neutral-200 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>NEW POST</span>
              </button>
              <button
                onClick={handleLogout}
                className="p-2 border border-borderline text-secondary hover:text-white rounded-full transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-borderline text-secondary hover:text-white rounded-full transition uppercase"
            >
              <span>ADMIN ACCESS</span>
            </button>
          )}
        </div>
      </div>

      {/* Posts List */}
      {isLoading ? (
        <div className="py-24 text-center font-mono text-xs text-muted">
          LOADING WRITEUPS & POSTS...
        </div>
      ) : error ? (
        <div className="p-6 border border-borderline bg-surface font-mono text-xs text-secondary rounded-2xl">
          {error}
        </div>
      ) : posts.length === 0 ? (
        <div className="py-24 text-center font-mono text-xs text-muted">
          NO POSTS PUBLISHED YET.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article
              key={post._id}
              className="bg-surface border border-borderline rounded-2xl p-6 flex flex-col justify-between hover:border-white transition-colors space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold px-3 py-1 rounded-full bg-panel border border-borderline text-secondary uppercase">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted">
                    <Calendar className="w-3 h-3 text-secondary" />
                    <span>{post.date}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-mono text-base font-bold text-white uppercase tracking-tight line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-secondary leading-relaxed line-clamp-3">
                    {post.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-borderline flex items-center justify-between font-mono text-xs">
                <span className="text-[11px] text-muted uppercase">BY {post.author}</span>

                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => {
                          setEditingPost(post);
                          setFormData({
                            title: post.title,
                            category: post.category,
                            author: post.author,
                            date: post.date,
                            description: post.description,
                            url: post.url,
                          });
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-secondary hover:text-white"
                        title="Edit Post"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingPost(post);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1.5 text-secondary hover:text-white"
                        title="Delete Post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {post.url ? (
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-panel border border-borderline hover:border-white text-white rounded-full text-[11px] font-bold uppercase transition"
                    >
                      <span>READ</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-muted uppercase">ARCHIVED</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-panel border border-borderline rounded-2xl w-full max-w-lg p-6 space-y-6 font-mono text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-borderline">
              <span className="font-bold text-sm text-white uppercase">
                {editingPost ? 'EDIT POST' : 'CREATE NEW POST'}
              </span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-secondary hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-muted uppercase">TITLE</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-surface border border-borderline rounded-lg p-2.5 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-muted uppercase">CATEGORY</label>
                  <input
                    type="text"
                    required
                    placeholder="PWN, Web, Crypto"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-surface border border-borderline rounded-lg p-2.5 text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted uppercase">AUTHOR</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full bg-surface border border-borderline rounded-lg p-2.5 text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted uppercase">DESCRIPTION / EXCERPT</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-surface border border-borderline rounded-lg p-2.5 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted uppercase">ARTICLE / WRITEUP URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full bg-surface border border-borderline rounded-lg p-2.5 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-borderline">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-borderline rounded-full text-secondary hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-white text-black font-bold uppercase rounded-full hover:bg-neutral-200"
                >
                  SAVE POST
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-panel border border-borderline rounded-2xl w-full max-w-sm p-6 space-y-4 font-mono text-xs">
            <div className="font-bold text-sm text-white uppercase">CONFIRM DELETE</div>
            <p className="text-secondary font-sans text-sm">
              Are you sure you want to delete post <strong>{deletingPost?.title}</strong>?
            </p>
            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-borderline rounded-full text-secondary hover:text-white"
              >
                CANCEL
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-white text-black font-bold uppercase rounded-full hover:bg-neutral-200"
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
