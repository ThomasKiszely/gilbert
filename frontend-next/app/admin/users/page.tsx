'use client'; // Nødvendigt pga. useState og useEffect

import { useEffect, useState } from "react";
import { api } from "@/app/api/api"; // Bruger alias @/ for nemheds skyld
import { useRouter } from "next/navigation";

const PAGE_SIZE = 10;

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    async function fetchUsers() {
        setLoading(true);
        try {
            const res = await api(`/api/admin/users?page=${page}&limit=${PAGE_SIZE}`);
            const data = await res.json();

            if (data && data.users) {
                setUsers(data.users);
                setTotalPages(data.totalPages);
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
            <h1 className="text-3xl font-bold mb-6 text-ivory-dark">Admin – Users</h1>

            <div className="space-y-4">
                {users.map((user) => (
                    <div key={user._id} className="p-4 bg-ivory-dark text-burgundy rounded-xl shadow-md">
                        <h3 className="text-xl font-semibold">{user.username}</h3>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Role:</strong> {user.role}</p>
                        <p><strong>Status:</strong> {user.professionalStatus}</p>

                        <button
                            // Vi bruger router.push til vores nye dynamiske rute
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