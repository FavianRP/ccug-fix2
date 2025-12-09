"use client";
import React, { useEffect, useState } from "react";
import { Trophy, Plus, Edit2, Trash2, X } from "lucide-react";
import Link from "next/link";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Contest {
  _id: string;
  place: number;
  event: string;
  year: number;
  rating: number;
  ctfPoints: number;
}

export default function ContestsPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingContest, setEditingContest] = useState<Contest | null>(null);
  const [deletingContest, setDeletingContest] = useState<Contest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const [formData, setFormData] = useState({
    place: "",
    event: "",
    year: "",
    rating: "",
    ctfPoints: "",
  });

  useEffect(() => {
    document.title = "Contests | CCUG";
    loadContests();
  }, [showAll]);

  const loadContests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const limit = showAll ? 100 : 25;
      const res = await fetch(`${BASE_URL}/api/contests?limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch contests");
      const data = await res.json();
      setContests(data);
    } catch (error) {
      console.error(error);
      setError("Failed to load contests. Make sure the backend server is running on port 5000.");
      setContests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (contest: Contest | null = null) => {
    if (contest) {
      setEditingContest(contest);
      setFormData({
        place: contest.place.toString(),
        event: contest.event,
        year: contest.year.toString(),
        rating: contest.rating.toString(),
        ctfPoints: contest.ctfPoints.toString(),
      });
    } else {
      setEditingContest(null);
      setFormData({
        place: "",
        event: "",
        year: new Date().getFullYear().toString(),
        rating: "",
        ctfPoints: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingContest(null);
    setFormData({
      place: "",
      event: "",
      year: "",
      rating: "",
      ctfPoints: "",
    });
  };

  const handleSubmit = async () => {
    if (!formData.place || !formData.event || !formData.year || !formData.rating || !formData.ctfPoints) {
      alert("All fields are required");
      return;
    }

    const contestData = {
      place: parseInt(formData.place),
      event: formData.event,
      year: parseInt(formData.year),
      rating: parseFloat(formData.rating),
      ctfPoints: parseInt(formData.ctfPoints),
    };

    try {
      let response;
      if (editingContest) {
        response = await fetch(`${BASE_URL}/api/contests/${editingContest._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contestData),
        });
      } else {
        response = await fetch(`${BASE_URL}/api/contests`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contestData),
        });
      }

      if (!response.ok) {
        throw new Error("Failed to save contest");
      }

      await loadContests();
      closeModal();
    } catch (error) {
      console.error("Error saving contest:", error);
      alert("Failed to save contest. Please try again.");
    }
  };

  const openDeleteModal = (contest: Contest) => {
    setDeletingContest(contest);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingContest(null);
  };

  const handleDelete = async () => {
    if (!deletingContest) return;

    try {
      const response = await fetch(`${BASE_URL}/api/contests/${deletingContest._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete contest");
      }

      await loadContests();
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting contest:", error);
      alert("Failed to delete contest. Please try again.");
    }
  };

  const getPlaceIcon = (place: number) => {
    if (place === 1) return "👑";
    if (place === 2) return "🥈";
    if (place === 3) return "🥉";
    if (place === 4) return "🏅";
    return "🏆";
  };

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  return (
    <div className="min-h-screen ccug-bg text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="mb-8">
          <p className="text-ccug-gray text-sm">
            <Link href="/" className="hover:text-white transition">
              Home
            </Link>
            <span className="mx-2">»</span>
            <span className="text-white">Contests</span>
          </p>
        </div>

        {/* Header */}
        <div className="mb-12 flex justify-between items-center flex-wrap gap-4">
          <div className="flex-1">
            <h2 className="text-4xl font-bold mb-4">Contests</h2>
            <div className="border-b border-ccug-purple w-full"></div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={toggleShowAll}
              className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 border border-blue-500/50 px-4 py-2 rounded-lg transition font-semibold text-sm"
            >
              {showAll ? "Show Top 25" : "Show Top 100"}
            </button>
            <button
              onClick={() => openModal()}
              className="bg-ccug-purple hover:bg-ccug-purple/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <Plus className="w-5 h-5" />
              Add Contest
            </button>
          </div>
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

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-ccug-purple"></div>
            <p className="text-ccug-gray mt-4">Loading contests...</p>
          </div>
        ) : contests.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-ccug-gray mx-auto mb-4" />
            <p className="text-ccug-gray mb-4">No contests yet. Add your first achievement!</p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-ccug-purple/20 text-left">
                    <th className="px-4 sm:px-6 py-4 font-semibold text-sm sm:text-base rounded-tl-lg">
                      PLACE
                    </th>
                    <th className="px-4 sm:px-6 py-4 font-semibold text-sm sm:text-base">
                      EVENT
                    </th>
                    <th className="px-4 sm:px-6 py-4 font-semibold text-sm sm:text-base text-right">
                      POINTS
                    </th>
                    <th className="px-4 sm:px-6 py-4 font-semibold text-sm sm:text-base text-right rounded-tr-lg">
                      ACTIONS
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {contests.map((contest, index) => (
                    <tr
                      key={contest._id}
                      className={`border-b border-gray-800 hover:bg-gray-900/50 transition ${
                        index % 2 === 0 ? "bg-gray-900/20" : ""
                      }`}
                    >
                      {/* Place */}
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-xl sm:text-2xl">
                            {getPlaceIcon(contest.place)}
                          </span>
                          <span className="font-bold text-lg sm:text-xl">
                            {contest.place}
                          </span>
                        </div>
                      </td>

                      {/* Event */}
                      <td className="px-4 sm:px-6 py-4">
                        <div>
                          <p className="font-semibold text-sm sm:text-base">
                            {contest.event}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-400">
                            ({contest.year})
                          </p>
                        </div>
                      </td>

                      {/* Points */}
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <div>
                          <p className="text-ccug-purple font-bold text-sm sm:text-base">
                            {contest.rating.toFixed(3)} rating points
                          </p>
                          <p className="text-xs sm:text-sm text-blue-400">
                            {contest.ctfPoints.toLocaleString()} CTF points
                          </p>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => openModal(contest)}
                            className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 p-2 rounded transition"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(contest)}
                            className="bg-red-500/20 hover:bg-red-500/40 text-red-300 p-2 rounded transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Stats Summary */}
            <div className="mt-8 p-6 bg-gray-900/50 rounded-lg border border-ccug-purple/20">
              <h3 className="text-xl font-bold mb-4">Achievement Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Total Contests</p>
                  <p className="text-2xl font-bold text-ccug-purple">{contests.length}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Best Placement</p>
                  <p className="text-2xl font-bold text-ccug-purple">
                    #{Math.min(...contests.map((c) => c.place))}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total CTF Points</p>
                  <p className="text-2xl font-bold text-ccug-purple">
                    {contests.reduce((sum, c) => sum + c.ctfPoints, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-ccug-dark border-2 border-ccug-purple rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">
                {editingContest ? "Edit Contest" : "Add New Contest"}
              </h3>
              <button onClick={closeModal} className="text-ccug-gray hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Place *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.place}
                  onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                  className="w-full bg-ccug-dark border border-ccug-gray/50 rounded px-3 py-2 text-white focus:border-ccug-purple focus:outline-none"
                  placeholder="Enter placement (e.g., 1, 2, 3)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Event Name *</label>
                <input
                  type="text"
                  value={formData.event}
                  onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                  className="w-full bg-ccug-dark border border-ccug-gray/50 rounded px-3 py-2 text-white focus:border-ccug-purple focus:outline-none"
                  placeholder="e.g., Grey Cat The Flag 2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Year *</label>
                <input
                  type="number"
                  min="2000"
                  max="2100"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full bg-ccug-dark border border-ccug-gray/50 rounded px-3 py-2 text-white focus:border-ccug-purple focus:outline-none"
                  placeholder="e.g., 2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Rating Points *</label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  className="w-full bg-ccug-dark border border-ccug-gray/50 rounded px-3 py-2 text-white focus:border-ccug-purple focus:outline-none"
                  placeholder="e.g., 47.339"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">CTF Points *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.ctfPoints}
                  onChange={(e) => setFormData({ ...formData, ctfPoints: e.target.value })}
                  className="w-full bg-ccug-dark border border-ccug-gray/50 rounded px-3 py-2 text-white focus:border-ccug-purple focus:outline-none"
                  placeholder="e.g., 16396"
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
                  {editingContest ? "Update" : "Add"}
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
            <h3 className="text-2xl font-bold mb-4">Delete Contest</h3>
            <p className="text-ccug-gray mb-6">
              Are you sure you want to delete{" "}
              <span className="text-white font-bold">{deletingContest?.event}</span>? This action
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