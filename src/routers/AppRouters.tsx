import { Routes, Route, Navigate } from "react-router";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { Auth } from "../pages/Auth";
import { Home } from "../pages/Home";
import { ProfileClient } from "../pages/ProfileClient";
import { CreateClient } from "../pages/CreateClient";
import { Eventos } from "../pages/Eventos";
import { CreateEvento } from "../pages/CreateEvento";

export const AppRouters = () => {
    return(
        <Routes>
            {/* Rutas públicas */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Rutas protegidas */}
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Home />} />
                <Route path="/create-client" element={<CreateClient />} />
                <Route path="/profile-client/:id" element={<ProfileClient />} />
                <Route path="/eventos" element={<Eventos />} />
                <Route path="/create-evento" element={<CreateEvento />} />
                {/* Aquí puedes añadir más rutas protegidas */}
            </Route>
            
            {/* Redirección para rutas no encontradas */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
};
