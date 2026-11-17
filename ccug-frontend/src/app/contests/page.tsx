"use client";

import React, { useEffect, useState } from "react";
import { Trophy, Plus, Edit2, Trash2, X, LogOut, ArrowLeft, Award, Medal, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Contest {
  _id: string;
  place: number;
  rankTitle?: string;
  event: string;
  host?: string;
  year: number;
}

export default function ContestsPage() {
  const router = useRouter();
  const [contests, setContests] = useState<Contest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingContest, setEditingContest] = useState<Contest | null>(null);
  const [deletingContest, setDeletingContest] = useState<Contest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [formData, setFormData] = useState({
    place: "0",
    rankTitle: "Finalist",
    event: "",
    host: "",
    year: new Date().getFullYear().toString(),
  });

  const getAuthHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  useEffect(() => {
    const checkAuth = () => {
      const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setCurrentUser(user);
          setIsAdmin(user.role === "admin");
        } catch (e) {}
      }
    };
    checkAuth();
  }, []);

  const loadContests = async () => {
    setIsLoading(true);
    setError(null);

    const endpoints = [
      `/api/contests?limit=150`,
      `https://ccug.gunadarma.ac.id/api/contests?limit=150`,
      `http://localhost:5000/api/contests?limit=150`,
    ];

    let loaded = false;

    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setContests(data);
          loaded = true;
          break;
        }
      } catch (err) {}
    }

    if (!loaded) {
      setError("Failed to load contests. Make sure the backend server is running on port 5000.");
      setContests([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    document.title = "Tournament Record & Trophies - CCUG";
    loadContests();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setIsAdmin(false);
  };

  const openModal = (contest: Contest | null = null) => {
    if (!isAdmin) {
      router.push("/login");
      return;
    }

    if (contest) {
      setEditingContest(contest);
      setFormData({
        place: contest.place.toString(),
        rankTitle: contest.rankTitle || (contest.place === 1 ? "1st Place" : contest.place === 2 ? "2nd Place" : contest.place === 3 ? "3rd Place" : "Finalist"),
        event: contest.event,
        host: contest.host || "",
        year: contest.year.toString(),
      });
    } else {
      setEditingContest(null);
      setFormData({
        place: "0",
        rankTitle: "Finalist",
        event: "",
        host: "",
        year: new Date().getFullYear().toString(),
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingContest(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const contestData = {
        place: parseInt(formData.place) || 0,
        rankTitle: formData.rankTitle || "Finalist",
        event: formData.event,
        host: formData.host,
        year: parseInt(formData.year) || new Date().getFullYear(),
      };

      let response;
      const baseUrl = typeof window !== "undefined" && window.location.origin.includes("ccug.gunadarma.ac.id") ? "" : "http://localhost:5000";

      if (editingContest) {
        response = await fetch(`${baseUrl}/api/contests/${editingContest._id}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          credentials: "include",
          body: JSON.stringify(contestData),
        });
      } else {
        response = await fetch(`${baseUrl}/api/contests`, {
          method: "POST",
          headers: getAuthHeaders(),
          credentials: "include",
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
      alert("Failed to save contest.");
    }
  };

  const openDeleteModal = (contest: Contest) => {
    if (!isAdmin) {
      router.push("/login");
      return;
    }
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
      const baseUrl = typeof window !== "undefined" && window.location.origin.includes("ccug.gunadarma.ac.id") ? "" : "http://localhost:5000";
      const response = await fetch(`${baseUrl}/api/contests/${deletingContest._id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete contest");
      }

      await loadContests();
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting contest:", error);
      alert("Failed to delete contest.");
    }
  };

  // Helper formatting badge
  const getBadgeStyle = (contest: Contest) => {
    const title = (contest.rankTitle || "").toLowerCase();
    const place = contest.place;

    if (place === 1 || title.includes("1st")) {
      return "bg-[#2a2614] border-[#5e5320] text-[#ffd54f]";
    }
    if (place === 2 || title.includes("2nd")) {
      return "bg-[#1c2834] border-[#28425a] text-[#78b3ea]";
    }
    if (place === 3 || title.includes("3rd") || title.includes("runner")) {
      return "bg-[#272119] border-[#4d3a24] text-[#f0a45d]";
    }
    if (title.includes("top")) {
      return "bg-[#241e2b] border-[#443054] text-[#cb98eb]";
    }
    return "bg-[#18231c] border-[#25422e] text-[#81C995]"; // Finalist
  };

  const getDisplayPlacement = (contest: Contest) => {
    if (contest.rankTitle) return contest.rankTitle;
    if (contest.place === 1) return "1st Place";
    if (contest.place === 2) return "2nd Place";
    if (contest.place === 3) return "3rd Place";
    if (contest.place > 0) return `Top ${contest.place}`;
    return "Finalist";
  };

  // Stats calculation
  const totalTournaments = contests.length;
  const podiumFinishes = contests.filter(
    (c) => c.place === 1 || c.place === 2 || c.place === 3 || (c.rankTitle && (c.rankTitle.includes("Place") || c.rankTitle.includes("Runner")))
  ).length;
  const championships = contests.filter((c) => c.place === 1 || (c.rankTitle && c.rankTitle.includes("1st"))).length;
  const finalists = totalTournaments - podiumFinishes;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-10">
        {/* Navigation & Admin bar */}
        <div className="flex items-center justify-between border-b border-[#262626] pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#a3a3a3] hover:text-white transition uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          {currentUser && isAdmin && (
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-[#81C995]">Logged in as Admin</span>
              <button
                onClick={() => openModal()}
                className="bg-white text-black font-heading text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full hover:bg-[#e5e5e5] transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Record</span>
              </button>
              <button
                onClick={handleLogout}
                className="text-xs font-mono text-[#a3a3a3] hover:text-white transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Page Title */}
        <section className="space-y-4">
          <div className="font-mono text-xs text-[#737373] uppercase tracking-widest flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-white" />
            <span>Competitive Milestones</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Tournament Record & Trophies
          </h1>
          <p className="text-[#a3a3a3] font-sans text-base max-w-2xl leading-relaxed">
            Historical podium finishes, championship titles, and competitive CTF achievements attained by
            Cyber Community Universitas Gunadarma since 2017.
          </p>
        </section>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-[#0c0c0c] border border-[#262626] rounded-2xl">
          <div>
            <p className="text-[#737373] font-mono text-xs uppercase tracking-wider">Total Contests</p>
            <p className="text-3xl font-heading font-extrabold text-white mt-1">{totalTournaments}</p>
          </div>
          <div>
            <p className="text-[#737373] font-mono text-xs uppercase tracking-wider">Championships (1st)</p>
            <p className="text-3xl font-heading font-extrabold text-[#ffd54f] mt-1">{championships}</p>
          </div>
          <div>
            <p className="text-[#737373] font-mono text-xs uppercase tracking-wider">Podium Finishes</p>
            <p className="text-3xl font-heading font-extrabold text-white mt-1">{podiumFinishes}</p>
          </div>
          <div>
            <p className="text-[#737373] font-mono text-xs uppercase tracking-wider">National Finalists</p>
            <p className="text-3xl font-heading font-extrabold text-[#81C995] mt-1">{finalists}</p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-[#1f1515] border border-[#4d2828] rounded-xl p-4 text-sm text-[#f87171]">
            <p>{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
            <p className="text-[#737373] font-mono text-xs mt-4">Loading tournament records...</p>
          </div>
        ) : contests.length === 0 ? (
          <div className="text-center py-20 border border-[#262626] rounded-2xl bg-[#0a0a0a]">
            <Trophy className="w-12 h-12 text-[#404040] mx-auto mb-3" />
            <p className="text-[#737373] font-mono text-sm">No tournament records found.</p>
          </div>
        ) : (
          /* Sleek Monochrome Table */
          <div className="border border-[#262626] rounded-2xl overflow-hidden bg-[#0c0c0c]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#262626] bg-[#111111] font-mono text-[11px] text-[#737373] uppercase tracking-wider">
                    <th className="py-4 px-6">Result / Placement</th>
                    <th className="py-4 px-6">Event & Organizer</th>
                    <th className="py-4 px-6 text-right">Year</th>
                    {isAdmin && <th className="py-4 px-6 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f1f1f] font-sans text-sm">
                  {contests.map((contest) => (
                    <tr key={contest._id} className="hover:bg-[#141414] transition">
                      {/* Placement */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${getBadgeStyle(
                            contest
                          )}`}
                        >
                          {getDisplayPlacement(contest)}
                        </span>
                      </td>

                      {/* Event & Organizer */}
                      <td className="py-4 px-6">
                        <div className="space-y-0.5">
                          <p className="font-heading font-bold text-white text-base">
                            {contest.event}
                          </p>
                          {contest.host && (
                            <p className="text-xs text-[#8a8a8a]">{contest.host}</p>
                          )}
                        </div>
                      </td>

                      {/* Year */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <span className="font-mono text-xs text-[#a3a3a3] bg-[#171717] px-2.5 py-1 rounded-md border border-[#262626]">
                          {contest.year}
                        </span>
                      </td>

                      {/* Actions for Admin */}
                      {isAdmin && (
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openModal(contest)}
                              className="p-1.5 text-[#a3a3a3] hover:text-white rounded hover:bg-[#262626] transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(contest)}
                              className="p-1.5 text-[#f87171] hover:text-red-300 rounded hover:bg-red-500/10 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Admin Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111111] border border-[#262626] rounded-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-[#262626] pb-4">
              <h3 className="font-heading text-lg font-bold text-white">
                {editingContest ? "Edit Tournament Record" : "Add Tournament Record"}
              </h3>
              <button onClick={closeModal} className="text-[#737373] hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-xs text-[#a3a3a3] mb-1.5">
                  Result / Placement Title (e.g. 1st Place, Finalist, Top 5) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.rankTitle}
                  onChange={(e) => setFormData({ ...formData, rankTitle: e.target.value })}
                  className="w-full bg-[#181818] border border-[#333333] rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white transition"
                  placeholder="e.g. 1st Place or Finalist"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-[#a3a3a3] mb-1.5">
                  Numeric Rank (1 for 1st, 2 for 2nd, 3 for 3rd, 0 for Finalist)
                </label>
                <input
                  type="number"
                  value={formData.place}
                  onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                  className="w-full bg-[#181818] border border-[#333333] rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white transition"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-[#a3a3a3] mb-1.5">Event Name *</label>
                <input
                  type="text"
                  required
                  value={formData.event}
                  onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                  className="w-full bg-[#181818] border border-[#333333] rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white transition"
                  placeholder="e.g. POLRICTF 2026"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-[#a3a3a3] mb-1.5">Organizer / Host</label>
                <input
                  type="text"
                  value={formData.host}
                  onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  className="w-full bg-[#181818] border border-[#333333] rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white transition"
                  placeholder="e.g. Universitas Gadjah Mada"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-[#a3a3a3] mb-1.5">Year *</label>
                <input
                  type="number"
                  required
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full bg-[#181818] border border-[#333333] rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white transition"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-mono text-[#a3a3a3] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white text-black font-heading text-xs font-bold uppercase tracking-wider rounded-full hover:bg-[#e5e5e5] transition"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingContest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111111] border border-[#262626] rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="font-heading text-lg font-bold text-white">Delete Tournament Record?</h3>
            <p className="text-xs text-[#a3a3a3] leading-relaxed">
              Are you sure you want to delete <strong>{deletingContest.event}</strong>? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-xs font-mono text-[#a3a3a3] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 bg-[#f87171] text-black font-heading text-xs font-bold uppercase tracking-wider rounded-full hover:bg-red-400 transition"
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
