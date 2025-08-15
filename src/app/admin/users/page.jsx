"use client";

import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import Layout from "@/components/Layout";
import FilterButton from "@/components/FilterButton";
import { Edit, Eye, Trash } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserProvider";
import { AuthProvider } from "@/context/AuthContext";

// Delete Confirmation Popup Component
function DeleteConfirmPopup({ open, onClose, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-lg p-8 min-w-[320px] flex flex-col items-center">
        <Trash className="text-red-500 mb-3 animate-bounce" size={36} />
        <div className="text-lg font-semibold mb-2 text-gray-800">
          Delete this user?
        </div>
        <div className="text-gray-500 mb-6 text-center">
          Are you sure you want to delete this user? This action cannot be
          undone.
        </div>
        <div className="flex gap-4">
          <button
            className="px-5 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-5 py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [dateFilter, setDateFilter] = useState("All");
  const [ageFilter, setAgeFilter] = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const usersPerPage = 10;
  function calculateAge(birthdate) {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  }

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users");
        const result = await res.json();
        if (!result.success)
          throw new Error(result.message || "Failed to fetch users");
        const mapped = (result.users || []).map((u) => ({
          id: u.id,
          name: u.full_name,
          email: u.email,
          phone: u.phone_number,
          age: calculateAge(u.birthdate),
          gender: u.gender,
          status: u.is_verified ? "Verified" : "Pending",
          created: u.created_at ? u.created_at.split("T")[0] : "",
          createdDate: u.created_at ? new Date(u.created_at) : new Date(),
        }));
        setUsers(mapped);
        setFilteredUsers(mapped);
      } catch (err) {
        setUsers([]);
        setFilteredUsers([]);
      }
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;

    if (search.trim() !== "") {
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          u.phone.includes(search)
      );
    }

    const today = new Date();
    result = result.filter((u) => {
      const created = new Date(u.createdDate);
      if (dateFilter === "Today") {
        return created.toDateString() === today.toDateString();
      }
      if (dateFilter === "Yesterday") {
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        return created.toDateString() === yesterday.toDateString();
      }
      if (dateFilter === "This Week") {
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        return created >= weekAgo;
      }
      if (dateFilter === "This Month") {
        return (
          created.getMonth() === today.getMonth() &&
          created.getFullYear() === today.getFullYear()
        );
      }
      return true;
    });

    result = result.filter((u) => {
      if (ageFilter === "18-25") return u.age >= 18 && u.age <= 25;
      if (ageFilter === "26-30") return u.age >= 26 && u.age <= 30;
      if (ageFilter === "31-40") return u.age >= 31 && u.age <= 40;
      return true;
    });

    if (genderFilter !== "All") {
      result = result.filter((u) => u.gender === genderFilter);
    }

    if (statusFilter !== "All") {
      result = result.filter((u) =>
        statusFilter === "Verified"
          ? u.status === "Verified"
          : u.status === "Pending"
      );
    }

    setFilteredUsers(result);
    setCurrentPage(1);
  }, [search, dateFilter, ageFilter, genderFilter, statusFilter, users]);

  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const [deletingUserId, setDeletingUserId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Show popup when delete button is clicked
  const handleDeleteClick = (userId) => {
    setConfirmDeleteId(userId);
  };

  // Called when user confirms delete in popup
  const confirmDeleteUser = async () => {
    const userId = confirmDeleteId;
    if (!userId) return;
    setDeletingUserId(userId);
    try {
      const res = await fetch(
        "https://fylgaowoigzaxqhgugxr.supabase.co/functions/v1/delete-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ id: userId }),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        console.error("Delete failed:", errText);
        toast.error("Failed to delete user");
        return;
      }

      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setFilteredUsers((prev) => prev.filter((u) => u.id !== userId));

      toast.success("User deleted successfully");
      setConfirmDeleteId(null);
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setDeletingUserId(null);
    }
  };

  const router = useRouter();

  const { user, accessToken } = useUser();
  useEffect(() => {
    if (!user?.id || !accessToken) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/users/${user.id}`, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
        });
        const data = await res.json();
        if (data.success && data.user.is_verified) {
          router.push("/admin/dashboard");
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user?.id, accessToken, router]);

  return (
    <AuthProvider>
      <Layout>
        {/* 🔹 Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold text-gray-800 mb-1">
            User Management
          </h1>
          <Link
            href={"/admin/users/add"}
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            <FiPlus size={16} /> Add User
          </Link>
        </div>

        {/* 🔹 Filters */}
        <div className="w-full bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-2 items-center justify-between">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, email or phone number"
            className="w-full md:w-1/2 px-4 py-2 bg-[#FAFAFA] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />

          <div className="flex flex-wrap gap-2 mt-2 md:mt-0 text-black">
            <FilterButton
              label="Days"
              options={["All", "Today", "Yesterday", "This Week", "This Month"]}
              selected={dateFilter}
              onSelect={setDateFilter}
            />
            <FilterButton
              label="Age"
              options={["All", "18-25", "26-30", "31-40"]}
              selected={ageFilter}
              onSelect={setAgeFilter}
            />
            <FilterButton
              label="Gender"
              options={["All", "Male", "Female", "Other"]}
              selected={genderFilter}
              onSelect={setGenderFilter}
            />
            <FilterButton
              label="Status"
              options={["All", "Verified", "Pending"]}
              selected={statusFilter}
              onSelect={setStatusFilter}
            />
            <button
              className="px-5 py-2 border border-zinc-300 text-blue-600 text-sm rounded-lg cursor-pointer hover:bg-red-600 hover:text-white"
              onClick={() => {
                setDateFilter("All");
                setAgeFilter("All");
                setGenderFilter("All");
                setStatusFilter("All");
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* 🔹 Table */}
        <div className="rounded-lg border border-slate-200 shadow-sm p-6 bg-white">
          <h2 className="text-slate-900 font-semibold text-lg mb-4">Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600 border-collapse border border-slate-200">
              <thead className="bg-slate-100 text-slate-500">
                <tr>
                  <th className="p-3 text-center">No.</th>
                  <th className="p-3 text-center">Name</th>
                  <th className="p-3 text-center">Email</th>
                  <th className="p-3 text-center">Phone</th>
                  <th className="p-3 text-center">Age</th>
                  <th className="p-3 text-center">Gender</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Created</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {currentUsers.length > 0 ? (
                  currentUsers.map((u, i) => (
                    <tr
                      key={u.id}
                      className="bg-white hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-center font-semibold">
                        {indexOfFirst + i + 1}
                      </td>
                      <td className="py-3 px-3 text-center">{u.name}</td>
                      <td className="py-3 px-3 text-center text-blue-500 hover:underline cursor-pointer">
                        {u.email}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {u.phone?.startsWith("+") ? (
                          <div className="flex items-center justify-center gap-2">
                            <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded">
                              {u.phone.split(" ")[0] ||
                                u.phone.match(/^\+\d+/)[0]}
                            </span>
                            <span>{u.phone.replace(/^\+\d+\s?/, "")}</span>
                          </div>
                        ) : (
                          u.phone
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">{u.age}</td>
                      <td className="py-3 px-3 text-center">{u.gender}</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block text-white text-xs font-semibold px-2 py-1 rounded-full ${
                            u.status === "Verified"
                              ? "bg-green-600"
                              : "bg-yellow-500"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">{u.created}</td>
                      <td className="py-3 px-3 text-center space-x-2 flex justify-center items-center gap-1">
                        <Link href={`/admin/users/view/${u.id}`}>
                          <Eye size={16} />
                        </Link>
                        <Link href={`/admin/users/edit/${u.id}`}>
                          <Edit size={16} />
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteClick(u.id);
                          }}
                          className="text-red-500 hover:text-red-700 flex items-center justify-center"
                          disabled={deletingUserId === u.id}
                        >
                          {deletingUserId === u.id ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash size={16} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* 🔹 Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 text-xs text-slate-500">
            <div>
              Showing {currentUsers.length} of {filteredUsers.length} users
            </div>
            <nav className="inline-flex space-x-2" aria-label="Pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === 1
                    ? "text-slate-400 bg-slate-100 cursor-not-allowed"
                    : "border border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`px-3 py-1 rounded border ${
                    currentPage === idx + 1
                      ? "bg-blue-500 text-white"
                      : "border-slate-300 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === totalPages
                    ? "text-slate-400 bg-slate-100 cursor-not-allowed"
                    : "border border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              >
                Next
              </button>
            </nav>
          </div>
        </div>
        {/* Delete Confirmation Popup */}
        <DeleteConfirmPopup
          open={!!confirmDeleteId}
          onClose={() => setConfirmDeleteId(null)}
          onConfirm={confirmDeleteUser}
        />
      </Layout>
    </AuthProvider>
  );
}
