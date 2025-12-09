"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Calendar, Plus, Edit2, Trash2, X } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    author: "",
    date: "",
    description: "",
    url: "",
  });

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

      const data = await res.json();
      setPosts(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error(error);
      setError("Failed to load posts. Make sure backend is running.");
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (post = null) => {
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
        date: new Date().toISOString().split("T")[0],
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
    if (!formData.title || !formData.category || !formData.author) {
      alert("Title, category, and author are required");
      return;
    }

    try {
      let response;

      if (editingPost) {
        response = await fetch(`${BASE_URL}/api/posts/${editingPost._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch(`${BASE_URL}/api/posts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      if (!response.ok) throw new Error("Failed to save post");

      await loadPosts();
      closeModal();
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Failed to save post.");
    }
  };

  const openDeleteModal = (post) => {
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
      });

      if (!response.ok) throw new Error("Failed to delete post");

      await loadPosts();
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen ccug-bg text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="mb-8">
          <p className="text-ccug-gray text-sm">
            <a href="/" className="hover:text-white transition">
              Home
            </a>
            <span className="mx-2">»</span>
            <span className="text-white">Posts</span>
          </p>
        </div>

        {/* Page Header */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-4xl font-bold">Posts</h2>
            <button
              onClick={() => openModal()}
              className="bg-ccug-purple hover:bg-ccug-purple/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <Plus className="w-5 h-5" />
              Add Post
            </button>
          </div>
          <p className="text-ccug-gray italic mb-4">Our writeups</p>
          <div className="border-b border-ccug-purple w-full"></div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-ccug-purple"></div>
            <p className="text-ccug-gray mt-4">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-ccug-gray mb-4">
              No posts yet. Add your first writeup!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <div key={post._id} className="relative group">
                {/* Admin controls */}
                <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openModal(post)}
                    className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 p-2 rounded transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => openDeleteModal(post)}
                    className="bg-red-500/20 hover:bg-red-500/40 text-red-300 p-2 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Post Card */}
                <Link href={`/posts/${post._id}`} className="block">
                  <h3 className="text-xl font-bold text-ccug-purple hover:text-green-300 transition mb-2">
                    {post.title}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-ccug-gray mb-3">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.date)}</span>
                  </div>

                  <p className="text-ccug-gray leading-relaxed">
                    {post.description}
                  </p>

                  <div className="border-b border-ccug-gray/30 mt-6"></div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-ccug-dark border-2 border-ccug-purple rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">
                {editingPost ? "Edit Post" : "Add New Post"}
              </h3>
              <button
                onClick={closeModal}
                className="text-ccug-gray hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full bg-ccug-dark border border-ccug-gray/50 rounded px-3 py-2 text-white focus:border-ccug-purple"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full bg-ccug-dark border border-ccug-gray/50 rounded px-3 py-2 text-white focus:border-ccug-purple"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Author *
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    className="w-full bg-ccug-dark border border-ccug-gray/50 rounded px-3 py-2 text-white focus:border-ccug-purple"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full bg-ccug-dark border border-ccug-gray/50 rounded px-3 py-2 text-white focus:border-ccug-purple"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-ccug-dark border border-ccug-gray/50 rounded px-3 py-2 text-white focus:border-ccug-purple"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Writeup URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                  className="w-full bg-ccug-dark border border-ccug-gray/50 rounded px-3 py-2 text-white focus:border-ccug-purple"
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

      {/* DELETE MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-ccug-dark border-2 border-red-500/50 rounded-lg max-w-md w-full p-6">
            <h3 className="text-2xl font-bold mb-4">Delete Post</h3>

            <p className="text-ccug-gray mb-6">
              Are you sure you want to delete{" "}
              <span className="text-white font-bold">{deletingPost?.title}</span>
              ? This action cannot be undone.
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
