import Link from "next/link";
import { BookOpen } from "lucide-react"; // Hvis du bruger Lucide ikoner ligesom før

export default function AdminDashboard() {
    return (
        <div className="max-w-4xl mx-auto p-6 mt-10">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <Link href="/admin/products" className="p-6 rounded-xl bg-ivory text-burgundy shadow-md hover:-translate-y-1 transition border border-transparent hover:border-burgundy/20">
                    <h2 className="text-xl font-semibold">Products</h2>
                    <p className="text-sm text-brown">See and administrate all products</p>
                </Link>

                <Link href="/admin/products-in-review" className="p-6 rounded-xl bg-ivory text-burgundy shadow-md hover:-translate-y-1 transition border border-transparent hover:border-burgundy/20">
                    <h2 className="text-xl font-semibold">Products in review</h2>
                    <p className="text-sm text-brown">Approve or reject new products</p>
                </Link>

                <Link href="/admin/users" className="p-6 rounded-xl bg-ivory text-burgundy shadow-md hover:-translate-y-1 transition border border-transparent hover:border-burgundy/20">
                    <h2 className="text-xl font-semibold">Users</h2>
                    <p className="text-sm text-brown">Administrate users and roles</p>
                </Link>

                {/* HER ER DIN BLOG INTEGRATION */}
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