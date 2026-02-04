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
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import EditProfilePage from "./pages/EditProfilePage";
import FavoritesPage from "./pages/FavoritesPage.tsx";
import ChangeEmailPage from "./pages/ChangeEmailPage";
import EmailChangeErrorPage from "./pages/EmailChangeErrorPage.tsx";
import EmailChangeSuccessPage from "./pages/EmailChangeSuccessPage.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";
import ServerErrorPage from "./pages/ServerErrorPage";


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
                    <Route
                        path="/change-password"
                        element={
                            <ProtectedRoute>
                                <ChangePasswordPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/me" element={ <ProtectedRoute>
                        <MePage />
                    </ProtectedRoute>
                    }
                    />
                    <Route
                        path="/edit-me"
                        element={
                            <ProtectedRoute>
                                <EditProfilePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/favorites"
                        element={
                            <ProtectedRoute>
                                <FavoritesPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/change-email"
                        element={
                            <ProtectedRoute>
                                <ChangeEmailPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="/verify-email" element={<VerifyEmailPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/email-change-error" element={<EmailChangeErrorPage />} />
                    <Route path="/email-change-success" element={<EmailChangeSuccessPage />} />


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
                        path="/admin/user-edit"
                        element={
                            <ProtectedAdminRoute>
                                <AdminUserEdit />
                            </ProtectedAdminRoute>
                        }
                    />
                </Route>

                <Route path="/500" element={<ServerErrorPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
