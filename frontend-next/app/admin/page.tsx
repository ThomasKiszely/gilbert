'use client';

import Link from "next/link";
import { BookOpen, AlertCircle, ShoppingBag, Gavel, ShieldCheck, Users, Package, CheckSquare } from "lucide-react";

export default function AdminDashboard() {
    return (
        <div className="max-w-6xl mx-auto p-6 mt-10">
            <h1 className="text-3xl font-bold mb-8 font-serif text-racing-green">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* ORDERS & SHIPPING */}
                <Link href="/admin/orders" className="p-6 rounded-xl bg-ivory text-burgundy shadow-md hover:-translate-y-1 transition border border-transparent hover:border-burgundy/20">
                    <div className="flex justify-between items-start">
                        <h2 className="text-xl font-semibold">Orders & Shipping</h2>
                        <ShoppingBag className="h-5 w-5 opacity-40" />
                    </div>
                    <p className="text-sm text-brown">Track sales and retry failed shipping labels</p>
                </Link>

                {/* DISPUTES */}
                <Link href="/admin/disputes" className="p-6 rounded-xl bg-ivory text-burgundy shadow-md hover:-translate-y-1 transition border border-transparent hover:border-burgundy/20">
                    <div className="flex justify-between items-start">
                        <h2 className="text-xl font-semibold">Open Disputes</h2>
                        <Gavel className="h-5 w-5 opacity-40" />
                    </div>
                    <p className="text-sm text-brown">Resolve conflicts between buyers and sellers</p>
                </Link>

                {/* AUTHENTICATION */}
                <Link href="/admin/authentication" className="p-6 rounded-xl bg-ivory text-burgundy shadow-md hover:-translate-y-1 transition border border-transparent hover:border-burgundy/20">
                    <div className="flex justify-between items-start">
                        <h2 className="text-xl font-semibold">Authentication</h2>
                        <ShieldCheck className="h-5 w-5 opacity-40" />
                    </div>
                    <p className="text-sm text-brown">Verify high-end products before shipping</p>
                </Link>

                {/* PRODUCTS IN REVIEW */}
                <Link href="/admin/products-in-review" className="p-6 rounded-xl bg-ivory text-burgundy shadow-md hover:-translate-y-1 transition border border-transparent hover:border-burgundy/20">
                    <div className="flex justify-between items-start">
                        <h2 className="text-xl font-semibold">Products in review</h2>
                        <CheckSquare className="h-5 w-5 opacity-40" />
                    </div>
                    <p className="text-sm text-brown">Approve or reject new products</p>
                </Link>

                {/* ALL PRODUCTS */}
                <Link href="/admin/products" className="p-6 rounded-xl bg-ivory text-burgundy shadow-md hover:-translate-y-1 transition border border-transparent hover:border-burgundy/20">
                    <div className="flex justify-between items-start">
                        <h2 className="text-xl font-semibold">All Products</h2>
                        <Package className="h-5 w-5 opacity-40" />
                    </div>
                    <p className="text-sm text-brown">See and administrate all products</p>
                </Link>

                {/* USERS */}
                <Link href="/admin/users" className="p-6 rounded-xl bg-ivory text-burgundy shadow-md hover:-translate-y-1 transition border border-transparent hover:border-burgundy/20">
                    <div className="flex justify-between items-start">
                        <h2 className="text-xl font-semibold">Users</h2>
                        <Users className="h-5 w-5 opacity-40" />
                    </div>
                    <p className="text-sm text-brown">Administrate users and roles</p>
                </Link>

                {/* USER REPORTS */}
                <Link href="/admin/reports" className="p-6 rounded-xl bg-ivory text-burgundy shadow-md hover:-translate-y-1 transition border border-transparent hover:border-burgundy/20">
                    <div className="flex justify-between items-start">
                        <h2 className="text-xl font-semibold">User Reports</h2>
                        <AlertCircle className="h-5 w-5 opacity-40" />
                    </div>
                    <p className="text-sm text-brown">Handle complaints and safety issues</p>
                </Link>

                {/* BLOG */}
                <Link href="/admin/blog" className="p-6 rounded-xl bg-ivory text-burgundy shadow-md hover:-translate-y-1 transition border border-transparent hover:border-burgundy/20">
                    <div className="flex justify-between items-start">
                        <h2 className="text-xl font-semibold">Journal / Blog</h2>
                        <BookOpen className="h-5 w-5 opacity-40" />
                    </div>
                    <p className="text-sm text-brown">Write stories and manage your blog posts</p>
                </Link>

            </div>
        </div>
    );
}