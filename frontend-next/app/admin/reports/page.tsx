'use client';

import { useEffect, useState } from "react";
import { api } from "@/app/api/api";
import Link from "next/link";
import { AlertCircle, CheckCircle2, XCircle, ArrowLeft, ShieldAlert } from "lucide-react";

export default function AdminReportsPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [adminReason, setAdminReason] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await api('/api/reports/pending');
            const json = await res.json();
            if (json.success) setReports(json.data);
        } catch (err) {
            console.error("Failed to fetch reports", err);
        } finally {
            setLoading(false);
        }
    };

    // Håndterer selve handlingen (Ban, Resolve eller Dismiss)
    const handleAction = async (actionType: 'ban' | 'resolve' | 'dismiss') => {
        if (!selectedReport) return;
        setIsProcessing(true);

        try {
            // 1. Hvis der skal bannes
            if (actionType === 'ban') {
                await api(`/api/admin/users/suspend/${selectedReport.reportedUser._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        isSuspended: true,
                        reason: adminReason || "Violating community guidelines"
                    })
                });
            }

            // 2. Opdater rapportens status
            const newStatus = actionType === 'dismiss' ? 'dismissed' : 'resolved';
            const res = await api(`/api/reports/${selectedReport._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                setReports(prev => prev.filter(r => r._id !== selectedReport._id));
                setSelectedReport(null);
                setAdminReason("");
            }
        } catch (err) {
            console.error("Action failed", err);
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-burgundy italic">Loading reports...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 mt-10 text-burgundy">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin" className="p-2 hover:bg-ivory rounded-full transition-colors">
                    <ArrowLeft className="h-6 w-6 text-burgundy" />
                </Link>
                <h1 className="text-3xl font-bold text-luxury">Pending Reports</h1>
            </div>

            <div className="bg-ivory rounded-2xl shadow-md border border-burgundy/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="border-b border-burgundy/10 bg-burgundy/5 text-burgundy">
                            <th className="p-4 font-semibold">Reporter</th>
                            <th className="p-4 font-semibold">Reported User</th>
                            <th className="p-4 font-semibold">Reason</th>
                            <th className="p-4 font-semibold">Details</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-burgundy/5">
                        {reports.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-brown italic">
                                    No pending reports. Great job!
                                </td>
                            </tr>
                        ) : (
                            reports.map((report) => (
                                <tr key={report._id} className="hover:bg-white/50 transition-colors">
                                    <td className="p-4 text-sm font-medium">
                                        @{report.reporter?.username || "Unknown"}
                                    </td>
                                    <td className="p-4 text-sm">
                                        <Link
                                            href={`/profile/${report.reportedUser?._id}`}
                                            className="underline hover:text-brown transition-colors font-semibold"
                                        >
                                            @{report.reportedUser?.username || "Unknown"}
                                        </Link>
                                    </td>
                                    <td className="p-4">
                                            <span className="text-xs px-2 py-1 bg-burgundy/10 rounded-md font-bold uppercase tracking-wider">
                                                {report.reason}
                                            </span>
                                    </td>
                                    <td className="p-4 text-sm text-brown max-w-xs truncate">
                                        {report.details}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => setSelectedReport(report)}
                                            className="bg-burgundy text-ivory px-4 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition shadow-sm"
                                        >
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL - Åbner når man trykker Review */}
            {selectedReport && (
                <div className="fixed inset-0 bg-burgundy/20 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
                    <div className="bg-ivory w-full max-w-md rounded-2xl shadow-2xl border border-burgundy/20 p-6 text-burgundy">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5" /> Take Action
                            </h2>
                            <button onClick={() => { setSelectedReport(null); setAdminReason(""); }}>
                                <XCircle className="h-6 w-6 opacity-30 hover:opacity-100 transition" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-white/50 p-3 rounded-lg border border-burgundy/5">
                                <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Report details:</p>
                                <p className="text-sm italic text-brown">"{selectedReport.details || 'No additional details'}"</p>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase mb-1 opacity-70 italic">Internal Admin Note / Reason</label>
                                <textarea
                                    className="w-full bg-white p-3 rounded-xl border border-burgundy/10 text-sm h-24 outline-none focus:ring-1 focus:ring-burgundy text-burgundy"
                                    placeholder="Why are you taking this action?"
                                    value={adminReason}
                                    onChange={(e) => setAdminReason(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button
                                    disabled={isProcessing}
                                    onClick={() => handleAction('dismiss')}
                                    className="py-2.5 rounded-xl border border-burgundy/20 text-xs font-bold hover:bg-white transition"
                                >
                                    Dismiss
                                </button>
                                <button
                                    disabled={isProcessing}
                                    onClick={() => handleAction('resolve')}
                                    className="py-2.5 rounded-xl bg-burgundy/10 text-xs font-bold hover:bg-burgundy/20 transition"
                                >
                                    Resolve Only
                                </button>
                                <button
                                    disabled={isProcessing || !adminReason}
                                    onClick={() => handleAction('ban')}
                                    className="col-span-2 py-3 rounded-xl bg-burgundy text-ivory text-xs font-bold hover:opacity-90 transition disabled:opacity-30 shadow-lg"
                                >
                                    {isProcessing ? "Processing..." : "BAN USER PERMANENTLY"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <p className="mt-6 text-xs text-brown italic opacity-60">
                Tip: Click on a reported user's name to inspect their profile before taking action.
            </p>
        </div>
    );
}