import { Routes, Route, Navigate } from "react-router";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { Auth } from "../pages/Auth";
import { Home } from "../pages/Home";
import { ProfileClient } from "../pages/ProfileClient";

export const AppRouters = () => {
    return(
        <Routes>
            {/* Rutas públicas */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Rutas protegidas */}
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Home />} />
                <Route path="/profile-client/:id" element={<ProfileClient />} />
                {/* Aquí puedes añadir más rutas protegidas */}
            </Route>
            
            {/* Redirección para rutas no encontradas */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
};
