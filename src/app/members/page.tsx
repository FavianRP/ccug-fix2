"use client";
import React, { useEffect, useState } from "react";
import { User, Plus, Edit2, Trash2, X } from "lucide-react";

// API Base URL - ambil dari environment variable atau default ke localhost
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deletingMember, setDeletingMember] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tags: "",
    avatar: "",
    blog: false,
  });

  // Load members from backend
  useEffect(() => {
    document.title = "Members | CCUG";
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/members`);
      if (!res.ok) throw new Error("Failed to fetch members");
      const data = await res.json();
      setMembers(data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
    } catch (error) {
      console.error(error);
      setError("Failed to load members. Make sure the backend server is running on port 5000.");
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        description: member.description,
        tags: member.tags.join(", "),
        avatar: member.avatar,
        blog: member.blog,
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: "",
        description: "",
        tags: "",
        avatar: "",
        blog: false,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
    setFormData({
      name: "",
      description: "",
      tags: "",
      avatar: "",
      blog: false,
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description) {
      alert("Name and description are required");
      return;
    }

    const memberData = {
      name: formData.name,
      description: formData.description,
      tags: formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      avatar: formData.avatar,
      blog: formData.blog,
    };

    try {
      let response;
      if (editingMember) {
        // UPDATE member
        response = await fetch(`${BASE_URL}/api/members/${editingMember._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(memberData),
        });
      } else {
        // CREATE member - FIX: gunakan BASE_URL juga!
        response = await fetch(`${BASE_URL}/api/members`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(memberData),
        });
      }

      if (!response.ok) {
        throw new Error("Failed to save member");
      }

      await loadMembers();
      closeModal();
    } catch (error) {
      console.error("Error saving member:", error);
      alert("Failed to save member. Please try again.");
    }
  };

  const openDeleteModal = (member) => {
    setDeletingMember(member);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingMember(null);
  };

  const handleDelete = async () => {
    if (!deletingMember) return;

    try {
      const response = await fetch(`${BASE_URL}/api/members/${deletingMember._id}`, { 
        method: "DELETE" 
      });

      if (!response.ok) {
        throw new Error("Failed to delete member");
      }

      await loadMembers();
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting member:", error);
      alert("Failed to delete member. Please try again.");
    }
  };

  return (
    <div className="min-h-screen ccug-bg text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <p className="text-ccug-gray text-sm">
            <a href="/" className="hover:text-white transition">Home</a>
            <span className="mx-2">»</span>
            <span className="text-white">Members</span>
          </p>
        </div>

        <div className="mb-12 flex justify-between items-center">
          <div className="flex-1">
            <h2 className="text-4xl font-bold mb-4">Members</h2>
            <div className="border-b border-ccug-purple w-full"></div>
          </div>
          <button
            onClick={() => openModal()}
            className="ml-4 bg-ccug-purple hover:bg-ccug-purple/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" />
            Add Member
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-300">{error}</p>
            <p className="text-red-300 text-sm mt-2">
              Make sure backend is running: <code className="bg-black/30 px-2 py-1 rounded">cd ccug-backend && npm run dev</code>
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-ccug-purple"></div>
            <p className="text-ccug-gray mt-4">Loading members...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-ccug-gray mb-4">No members yet. Add your first member!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {members.map((member) => (
              <div
                key={member._id}
                className="border-2 border-ccug-purple/50 rounded-lg p-6 bg-ccug-dark/50 hover:border-ccug-gray transition-colors relative"
              >
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => openModal(member)}
                    className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 p-2 rounded transition"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(member)}
                    className="bg-red-500/20 hover:bg-red-500/40 text-red-300 p-2 rounded transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-ccug-gray/20 flex items-center justify-center overflow-hidden">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-ccug-gray" />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 pr-16">
                    <h3 className="text-xl font-bold mb-2 font-mono">{member.name}</h3>
                    <p className="text-ccug-gray text-sm mb-4">{member.description}</p>

                    {member.tags && member.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {member.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className={`px-3 py-1 rounded text-xs font-medium ${
                              tag === "founder"
                                ? "bg-red-500/20 text-red-300 border border-red-500/50"
                                : tag === "pwn"
                                ? "bg-orange-500/20 text-orange-300 border border-orange-500/50"
                                : tag === "rev"
                                ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/50"
                                : tag === "for"
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/50"
                                : tag === "blockchain"
                                ? "bg-teal-500/20 text-teal-300 border border-teal-500/50"
                                : tag === "ai/ml"
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/50"
                                : tag === "web"
                                ? "bg-green-500/20 text-green-300 border border-green-500/50"
                                : tag === "crypto"
                                ? "bg-pink-500/20 text-pink-300 border border-pink-500/50"
                                : "bg-gray-500/20 text-gray-300 border border-gray-500/50"
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {member.blog && (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        <span className="text-xs text-green-400 font-mono">Blog</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-ccug-dark border-2 border-ccug-purple rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">{editingMember ? "Edit Member" : "Add New Member"}</h3>
              <button onClick={closeModal} className="text-ccug-gray hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-ccug-dark border border-ccug-gray/50 rounded px-3 py-2 text-white focus:border-ccug-purple focus:outline-none"
                  placeholder="Enter member name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-ccug-dark border border-ccug-gray/50 rounded px-3 py-2 text-white focus:border-ccug-purple focus:outline-none"
                  placeholder="Enter description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full bg-ccug-dark border border-ccug-gray/50 rounded px-3 py-2 text-white focus:border-ccug-purple focus:outline-none"
                  placeholder="e.g. founder, pwn, rev"
                />
                <p className="text-xs text-ccug-gray mt-1">
                  Available: founder, pwn, rev, for, blockchain, ai/ml, web, crypto
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Avatar URL</label>
                <input
                  type="text"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  className="w-full bg-ccug-dark border border-ccug-gray/50 rounded px-3 py-2 text-white focus:border-ccug-purple focus:outline-none"
                  placeholder="Enter image URL"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="blog"
                  checked={formData.blog}
                  onChange={(e) => setFormData({ ...formData, blog: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="blog" className="text-sm">Has Blog</label>
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
                  {editingMember ? "Update" : "Add"}
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
            <h3 className="text-2xl font-bold mb-4">Delete Member</h3>
            <p className="text-ccug-gray mb-6">
              Are you sure you want to delete <span className="text-white font-bold">{deletingMember?.name}</span>? This action cannot be undone.
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