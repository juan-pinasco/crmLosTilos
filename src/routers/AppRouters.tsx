import { Routes, Route, Navigate } from "react-router";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { Auth } from "../pages/Auth";
import { Home } from "../pages/HomeClients";
import { ProfileClient } from "../pages/ProfileClient";
import { CreateClient } from "../pages/CreateClient";
import { Eventos } from "../pages/eventos/Eventos";
import { CreateEvento } from "../pages/eventos/CreateEvento";
import { CalendarioEventos } from "../pages/eventos/CalendarioEventos";
import { DetalleEvento } from "../pages/eventos/DetalleEvento";
import { Observaciones } from "../pages/observaciones";

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
                <Route path="/calendario-eventos" element={<CalendarioEventos />} />
                <Route path="/detalle-evento/:id" element={<DetalleEvento />} />
                <Route path="/observaciones" element={<Observaciones />} />
                {/* Aquí puedes añadir más rutas protegidas */}
            </Route>
            
            {/* Redirección para rutas no encontradas */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
};
