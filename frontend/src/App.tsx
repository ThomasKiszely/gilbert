import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Index from "./pages/index";
import CreateProduct from "./pages/CreateProduct";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";


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

                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default App;
