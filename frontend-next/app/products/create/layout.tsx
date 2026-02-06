import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import CreateProduct from "@/app/products/create/page";
export default function Page() {
    return (
        <ProtectedRoute>
            <CreateProduct />
        </ProtectedRoute>
    );
}
