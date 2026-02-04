import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Index from "./pages/index";
import CreateProduct from "./pages/CreateProduct";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";


import ProtectedAdminRoute from "./components/auth/ProtectedAdminRoute";
import AdminDashboard from "./pages/admin/adminDashboard";
import AdminProductsInReview from "./pages/admin/AdminProductsInReview.tsx";
import AdminUsers from "./pages/admin/AdminUsers.tsx";
import AdminUserEdit from "./pages/admin/AdminUserEdit.tsx";
import MePage from "./pages/MePage.tsx";


function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route element={<Layout />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/create-product" element={
                        <ProtectedRoute>
                            <CreateProduct />
                        </ProtectedRoute>
                        } />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/me" element={ <ProtectedRoute>
                        <MePage />
                    </ProtectedRoute>
                    }
                    />

                    {/* Admin routes */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedAdminRoute>
                                <AdminDashboard />
                            </ProtectedAdminRoute>
                        }
                    />
                    <Route
                        path="/admin/review"
                        element={
                            <ProtectedAdminRoute>
                                <AdminProductsInReview />
                            </ProtectedAdminRoute>
                        }
                    />
                    <Route
                        path="/admin/users"
                        element={
                            <ProtectedAdminRoute>
                                <AdminUsers />
                            </ProtectedAdminRoute>
                        }
                    />

                    <Route
                        path="/admin-user-edit"
                        element={
                            <ProtectedAdminRoute>
                                <AdminUserEdit />
                            </ProtectedAdminRoute>
                        }
                    />
                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default App;
