'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import {
    Tag, Plus, Trash2, X, ShieldCheck,
    Power, PowerOff, Copy, Check
} from "lucide-react";
import { Button } from "@/app/components/UI/button";

export default function DiscountAdminPage() {
    const { user } = useAuth();
    const [codes, setCodes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        code: "",
        type: "percentage",
        amount: 10,
        expiresAt: "",
        maxUses: 100,
        active: true,
        appliesTo: {
            firstPurchaseOnly: false,
            categories: "",
            minPrice: 0
        }
    });

    // We run this every time user object changes to ensure we have the token
    useEffect(() => {
        fetchCodes();
    }, [user]);

    const fetchCodes = async () => {
        try {
            const res = await fetch("/api/discount-codes", {
                headers: { "Authorization": `Bearer ${user?.token}` }
            });
            const data = await res.json();
            if (data.success) {
                setCodes(data.codes);
            }
        } catch (err) {
            console.error("Failed to fetch codes");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/discount-codes/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user?.token}`
                },
                body: JSON.stringify({ active: !currentStatus })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setCodes((prev: any[]) => prev.map((c: any) =>
                    c._id === id ? { ...c, active: !currentStatus } : c
                ));
            } else {
                alert("Could not update status. Please check if backend is running.");
            }
        } catch (err) {
            console.error("Toggle failed", err);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            appliesTo: {
                ...formData.appliesTo,
                categories: formData.appliesTo.categories
                    ? formData.appliesTo.categories.split(",").map(c => c.trim().toLowerCase()).filter(c => c !== "")
                    : []
            }
        };

        try {
            const res = await fetch("/api/discount-codes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user?.token}`
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setShowModal(false);
                setFormData({
                    code: "", type: "percentage", amount: 10, expiresAt: "", maxUses: 100, active: true,
                    appliesTo: { firstPurchaseOnly: false, categories: "", minPrice: 0 }
                });
                fetchCodes();
            }
        } catch (err) {
            alert("Error creating code");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This action cannot be undone.")) return;
        try {
            const res = await fetch(`/api/discount-codes/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${user?.token}` }
            });
            if (res.ok) fetchCodes();
        } catch (err) {
            alert("Failed to delete");
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 mt-10">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-racing-green">Discount Codes</h1>
                    <p className="text-sm text-brown uppercase tracking-widest mt-1">Admin Control Panel</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-burgundy text-white px-6 py-3 rounded-full font-bold hover:bg-black transition shadow-lg"
                >
                    <Plus size={18} />
                    New Campaign
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-ivory/50 border-b border-gray-100">
                    <tr>
                        <th className="p-4 text-[10px] font-black uppercase text-burgundy/50">Code</th>
                        <th className="p-4 text-[10px] font-black uppercase text-burgundy/50">Value</th>
                        <th className="p-4 text-[10px] font-black uppercase text-burgundy/50">Used</th>
                        <th className="p-4 text-[10px] font-black uppercase text-burgundy/50">Status</th>
                        <th className="p-4 text-xs font-black uppercase text-burgundy/50 text-right">Action</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                    {loading ? (
                        <tr><td colSpan={5} className="p-10 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">Fetching data...</td></tr>
                    ) : codes.length === 0 ? (
                        <tr><td colSpan={5} className="p-10 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">No discount codes found</td></tr>
                    ) : (
                        codes.map((c: any) => (
                            <tr key={c._id} className={`hover:bg-ivory/20 transition-colors ${!c.active ? 'opacity-50' : ''}`}>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono font-bold text-racing-green">{c.code}</span>
                                        <button
                                            onClick={() => copyToClipboard(c.code, c._id)}
                                            className="text-gray-300 hover:text-burgundy transition-colors"
                                        >
                                            {copiedId === c._id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                </td>
                                <td className="p-4 text-sm font-bold text-black">{c.amount}{c.type === 'percentage' ? '%' : ' DKK'}</td>
                                <td className="p-4 text-sm text-gray-500 font-mono">{c.usedCount || 0} / {c.maxUses}</td>
                                <td className="p-4">
                                    <button
                                        onClick={() => handleToggleActive(c._id, c.active)}
                                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-2 transition-all ${
                                            c.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-50 text-red-500 hover:bg-red-100'
                                        }`}
                                    >
                                        {c.active ? <Power size={10} /> : <PowerOff size={10} />}
                                        {c.active ? 'Active' : 'Paused'}
                                    </button>
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => handleDelete(c._id)} className="text-red-200 hover:text-red-600 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* CREATE MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-racing-green/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                        <button onClick={() => setShowModal(false)} className="absolute top-6 right-8 text-gray-400 hover:text-black z-[110]"><X size={24} /></button>
                        <form onSubmit={handleCreate} className="p-12 overflow-y-auto custom-scrollbar">
                            <h2 className="text-3xl font-serif font-bold text-racing-green mb-2">Create Discount</h2>
                            <p className="text-gray-400 text-xs mb-10 uppercase tracking-widest font-bold">Campaign Settings</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-burgundy/40 ml-1">Code Name</label>
                                    <input required className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl text-black font-mono font-bold uppercase outline-none focus:border-burgundy" placeholder="E.G. SALE20" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-burgundy/40 ml-1">Expiry Date</label>
                                    <input type="date" required className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl text-black font-bold outline-none" value={formData.expiresAt} onChange={e => setFormData({...formData, expiresAt: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-burgundy/40 ml-1">Type</label>
                                    <select className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl text-black font-bold outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (DKK)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-burgundy/40 ml-1">Amount</label>
                                    <input type="number" required className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl text-black font-bold outline-none" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
                                </div>
                            </div>

                            <div className="bg-ivory/30 p-8 rounded-[2rem] mb-10 border border-ivory space-y-5">
                                <div className="flex items-center gap-2 text-racing-green">
                                    <ShieldCheck size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-black/60">Platform Restrictions</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-burgundy/40 uppercase">Max Uses</label>
                                        <input type="number" className="w-full bg-white p-3 rounded-xl text-black font-bold border border-gray-100" value={formData.maxUses} onChange={e => setFormData({...formData, maxUses: Number(e.target.value)})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-burgundy/40 uppercase">Min Price</label>
                                        <input type="number" className="w-full bg-white p-3 rounded-xl text-black font-bold border border-gray-100" value={formData.appliesTo.minPrice} onChange={e => setFormData({...formData, appliesTo: {...formData.appliesTo, minPrice: Number(e.target.value)}})} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-burgundy/40 uppercase">Categories (comma separated)</label>
                                    <input placeholder="sneakers, bags" className="w-full bg-white p-3 rounded-xl text-black font-bold border border-gray-100 text-xs" value={formData.appliesTo.categories} onChange={e => setFormData({...formData, appliesTo: {...formData.appliesTo, categories: e.target.value}})} />
                                </div>
                                <label className="flex items-center gap-3 cursor-pointer pt-2">
                                    <input type="checkbox" className="w-4 h-4 accent-racing-green" checked={formData.appliesTo.firstPurchaseOnly} onChange={e => setFormData({...formData, appliesTo: {...formData.appliesTo, firstPurchaseOnly: e.target.checked}})} />
                                    <span className="text-[10px] font-black uppercase text-racing-green">Apply to first purchase only</span>
                                </label>
                            </div>

                            <Button type="submit" className="w-full bg-racing-green hover:bg-black text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl transition-all">
                                Launch Campaign
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}