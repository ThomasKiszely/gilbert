import { Link } from "react-router-dom";

export default function AdminDashboard() {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <Link to="/admin/products" className="p-6 rounded-xl bg-ivory text-burgundy shadow-md hover:-translate-y-1 transition">
                    <h2 className="text-xl font-semibold">Products</h2>
                    <p className="text-sm text-brown">See and administrate all products</p>
                </Link>

                <Link to="/admin/review" className="p-6 rounded-xl bg-ivory text-burgundy shadow-md hover:-translate-y-1 transition">
                    <h2 className="text-xl font-semibold">Products in review</h2>
                    <p className="text-sm text-brown">Approve or reject new products</p>
                </Link>

                <Link to="/admin/users" className="p-6 rounded-xl bg-ivory text-burgundy shadow-md hover:-translate-y-1 transition">
                    <h2 className="text-xl font-semibold">Users</h2>
                    <p className="text-sm text-brown">Administrate users and roles</p>
                </Link>

            </div>
        </div>
    );
}
