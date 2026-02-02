import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Index from "./pages/index";
import CreateProduct from "./pages/CreateProduct";
import LoginPage from "./pages/LoginPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route element={<Layout />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/create-product" element={<CreateProduct />} />
                    <Route path="/login" element={<LoginPage />} />
                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default App;
