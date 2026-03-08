'use client'; // Nødvendigt pga. useState og useEffect

import { useEffect, useState } from "react";
import { api } from "@/app/api/api";
import { useRouter } from "next/navigation";

const PAGE_SIZE = 10;

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [pendingCount, setPendingCount] = useState(0); // ⭐ Tracking af pending brugere

    const router = useRouter();

    async function fetchUsers() {
        setLoading(true);
        try {
            const res = await api(`/api/admin/users?page=${page}&limit=${PAGE_SIZE}`);
            const data = await res.json();

            if (data && data.users) {
                setUsers(data.users);
                setTotalPages(data.totalPages);
                setPendingCount(data.pendingCount || 0); // ⭐ Gemmer tælleren fra API
            }
        } catch (err) {
            console.error("Could not fetch users", err);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchUsers();
    }, [page]);

    if (loading) {
        return <p className="p-6 text-center">Loading users…</p>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* ⭐ Overskrift med pending notifikation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h1 className="text-3xl font-bold text-ivory-dark">Admin – Users</h1>

                {pendingCount > 0 && (
                    <div className="flex items-center bg-red-100 border border-red-200 text-red-700 px-4 py-2 rounded-full text-sm shadow-sm animate-pulse">
                        <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                        <strong>{pendingCount}</strong>&nbsp;brugere afventer CVR-godkendelse
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {users.map((user) => (
                    <div
                        key={user._id}
                        className={`p-4 rounded-xl shadow-md border-l-4 ${
                            user.professionalStatus === 'pending'
                                ? 'bg-red-50 border-red-500 text-burgundy'
                                : 'bg-ivory-dark border-transparent text-burgundy'
                        }`}
                    >
                        <h3 className="text-xl font-semibold flex items-center justify-between">
                            {user.username}
                            {user.professionalStatus === 'pending' && (
                                <span className="text-[10px] bg-red-600 text-white px-2 py-1 rounded-full uppercase tracking-wider">
                                    Pending
                                </span>
                            )}
                        </h3>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Role:</strong> {user.role}</p>
                        <p><strong>Status:</strong> {user.professionalStatus || 'None'}</p>

                        <button
                            onClick={() => router.push(`/admin/users/${user._id}`)}
                            className="mt-3 px-4 py-2 bg-racing-green text-ivory rounded-lg hover:bg-racing-green-light"
                        >
                            Edit
                        </button>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-4 mt-6">
                <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-40"
                >
                    Previous
                </button>

                <span>Page {page} of {totalPages}</span>

                <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-40"
                >
                    Next
                </button>
            </div>
        </div>
    );
}