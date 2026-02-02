"use client";
import React, { useEffect, useState } from "react";
import { Calendar, Plus, Edit2, Trash2, X, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

// API Base URL
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Post = {
  _id: string;
  title: string;
  category: string;
  author: string;
  date: string;
  description: string;
  url: string;
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
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    author: "",
    date: "",
    description: "",
    url: "",
  });

  // Helper function untuk mendapatkan auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        setIsAdmin(user.role === "admin");
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    document.title = "Posts | CCUG";
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/posts`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data: Post[] = await res.json();

      setPosts(
        data.sort(
          (a: Post, b: Post) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        )     
      );
    } catch (error) {
      console.error(error);
      setError("Failed to load posts. Make sure the backend server is running.");
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setIsAdmin(false);
    router.push("/login");
  };

  const openModal = (post: Post | null = null) => {
    // Check if user is admin
    if (!isAdmin) {
      alert("Only admins can add or edit posts. Please login as admin.");
      router.push("/login");
      return;
    }

    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title,
        category: post.category,
        author: post.author,
        date: post.date,
        description: post.description,
        url: post.url,
      });
    } else {
      setEditingPost(null);
      setFormData({
        title: "",
        category: "",
        author: "",
        date: new Date().toISOString().split('T')[0],
        description: "",
        url: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.category || !formData.author || !formData.url) {
      alert("Title, category, author, and URL are required");
      return;
    }

    try {
      let response;
      if (editingPost) {
        response = await fetch(`${BASE_URL}/api/posts/${editingPost._id}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          credentials: "include",
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch(`${BASE_URL}/api/posts`, {
          method: "POST",
          headers: getAuthHeaders(),
          credentials: "include",
          body: JSON.stringify(formData),
        });
      }

      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json();
        alert(errorData.message || "You must be logged in as admin to perform this action");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }

      if (!response.ok) throw new Error("Failed to save post");

      await loadPosts();
      closeModal();
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Failed to save post. Please try again.");
    }
  };

  const openDeleteModal = (post: Post) => {
    // Check if user is admin
    if (!isAdmin) {
      alert("Only admins can delete posts. Please login as admin.");
      router.push("/login");
      return;
    }

    setDeletingPost(post);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingPost(null);
  };

  const handleDelete = async () => {
    if (!deletingPost) return;

    try {
      const response = await fetch(`${BASE_URL}/api/posts/${deletingPost._id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        const errorData = await response.json();
        alert(errorData.message || "You must be logged in as admin to perform this action");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }

      if (!response.ok) throw new Error("Failed to delete post");

      await loadPosts();
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short', 
      year: 'numeric'
    });
  };

  function getCategoryColor(category: string) {
    if (!category) {
      return {
        className: "border border-gray-500/50 text-gray-300",
        style: { backgroundColor: "rgba(100,100,100,0.2)" }
      };
    }

    // Hash kategori buat jadi angka
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash % 360);

    return {
      className: "border border-white/20 text-white",
      style: {
        backgroundColor: `hsl(${hue}, 70%, 20%)`
      }
    };
  }

  function parseCategories(categoryString: string) {
    return categoryString
      .split(",")
      .map(c => c.trim())
      .filter(c => c.length > 0);
  }

  return (
    <div className="min-h-screen ccug-bg text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb & User Info */}
        <div className="mb-8 flex justify-between items-center">
          <p className="text-ccug-gray text-sm">
            <a href="/" className="hover:text-white transition">Home</a>
            <span className="mx-2">»</span>
            <span className="text-white">Posts (Page 1)</span>
          </p>

          {/* User Info & Logout */}
          {currentUser && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-white font-medium">{currentUser.username}</p>
                <p className="text-xs text-ccug-gray">
                  {isAdmin ? "Admin" : "User"}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/50 px-3 py-2 rounded-lg flex items-center gap-2 transition text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Page Header */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-4xl font-bold">Posts</h2>
            
            {/* Add Post Button - Only show if admin */}
            {isAdmin && (
              <button
                onClick={() => openModal()}
                className="bg-ccug-purple hover:bg-ccug-purple/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <Plus className="w-5 h-5" />
                Add Post
              </button>
            )}
          </div>
          <p className="text-ccug-gray italic mb-4">Our writeups</p>
          <div className="border-b border-ccug-purple w-full"></div>
        </div>

        {/* Info Message for non-admin users */}
        {!isAdmin && (
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-6">
            <p className="text-blue-300 text-sm">
              ℹ️ You are viewing posts in read-only mode. 
              {!currentUser && (
                <span> <a className="font-medium">Login as admin</a> to add, edit, or delete posts.</span>
              )}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-ccug-purple"></div>
            <p className="text-ccug-gray mt-4">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-ccug-gray mb-4">No posts yet. {isAdmin && "Add your first writeup!"}</p>
          </div>
        ) : (
          /* Posts List */
          <div className="space-y-8">
            {posts.map((post: Post) => (
              <div key={post._id} className="relative group">
                {/* Admin Controls - Only show if admin */}
                {isAdmin && (
                  <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={() => openModal(post)}
                      className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 p-2 rounded transition"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(post)}
                      className="bg-red-500/20 hover:bg-red-500/40 text-red-300 p-2 rounded transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Post Content */}
                  {post.url ? (
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <h3 className="text-xl font-bold text-ccug-purple hover:text-green-300 transition mb-2">
                        {post.title}
                      </h3>

                      <div className="flex items-center gap-2 text-sm text-ccug-gray mb-3">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(post.date)}</span>
                      </div>

                      <p className="text-ccug-gray leading-relaxed mb-3">
                        {post.description}
                      </p>

                      {/* CATEGORY BADGE */}
                      {post.category &&
                        parseCategories(post.category).map((cat, i) => {
                          const color = getCategoryColor(cat);
                          return (
                            <span
                              key={i}
                              className={`px-3 py-1 rounded text-xs font-medium capitalize mr-2 ${color.className}`}
                              style={color.style}
                            >
                              {cat}
                            </span>
                          );
                        })}
                    </a>
                  ) : (
                  <div>
                    <h3 className="text-xl font-bold text-green-400 mb-2">
                      {post.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-sm text-ccug-gray mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.date)}</span>
                    </div>

                    <p className="text-ccug-gray leading-relaxed">
                      {post.description}
                    </p>
                  </div>
                )}

                <div className="border-b border-ccug-gray/30 mt-6"></div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-ccug-dark border-2 border-ccug-purple rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">
                {editingPost ? "Edit Post" : "Add New Post"}
              </h3>
              <button onClick={closeModal} className="text-ccug-gray hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-ccug-dark border border-ccug-gray/50 rounded px-3 py-2 text-white focus:border-ccug-purple focus:outline-none"
                  placeholder="e.g. HTB Cyber Apocalypse 2025 - Cryptography"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-ccug-dark border border-ccug-gray/50 rounded px-3 py-2 text-white focus:border-ccug-purple focus:outline-none"
                    placeholder="e.g. Cryptography, Forensics, Web"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Author *</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full bg-ccug-dark border border-ccug-gray/50 rounded px-3 py-2 text-white focus:border-ccug-purple focus:outline-none"
                    placeholder="e.g. azuketto, k.eii"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-ccug-dark border border-ccug-gray/50 rounded px-3 py-2 text-white focus:border-ccug-purple focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-ccug-dark border border-ccug-gray/50 rounded px-3 py-2 text-white focus:border-ccug-purple focus:outline-none"
                  placeholder="Brief description of the writeup"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Writeup URL *</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full bg-ccug-dark border border-ccug-gray/50 rounded px-3 py-2 text-white focus:border-ccug-purple focus:outline-none"
                  placeholder="https://example.com/writeup"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeModal}
                  className="flex-1 bg-ccug-gray/20 hover:bg-ccug-gray/40 text-white px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-ccug-purple hover:bg-ccug-purple/80 text-white px-4 py-2 rounded-lg transition"
                >
                  {editingPost ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-ccug-dark border-2 border-red-500/50 rounded-lg max-w-md w-full p-6">
            <h3 className="text-2xl font-bold mb-4">Delete Post</h3>
            <p className="text-ccug-gray mb-6">
              Are you sure you want to delete{" "}
              <span className="text-white font-bold">{deletingPost?.title}</span>? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                className="flex-1 bg-ccug-gray/20 hover:bg-ccug-gray/40 text-white px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/50 px-4 py-2 rounded-lg transition"
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