import { useState } from 'react';
import { supabase } from '../integrations/supabase';
import { useNavigate } from 'react-router';

export const Auth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resetPassword, setResetPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            navigate('/'); // Redirigir a la página principal después de iniciar sesión
        } catch (error: any) {
            setError(error.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            
            if (error) throw error;
            alert('Se ha enviado un correo para restablecer tu contraseña');
            setResetPassword(false);
        } catch (error: any) {
            setError(error.message || 'Error al enviar el correo de restablecimiento');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    {resetPassword ? 'Restablecer Contraseña' : 'Iniciar Sesión'}
                </h1>
                
                {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">
                        {error}
                    </div>
                )}
                
                {!resetPassword ? (
                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="font-medium text-sm text-gray-700">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="tu@email.com"
                            />
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <label htmlFor="password" className="font-medium text-sm text-gray-700">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="••••••••"
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            className={`mt-2 py-2 px-4 rounded-md font-medium text-white ${
                                loading 
                                    ? 'bg-blue-400 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                            }`}
                            disabled={loading}
                        >
                            {loading ? 'Cargando...' : 'Iniciar Sesión'}
                        </button>
                        
                        <p className="text-center text-sm mt-4">
                            <a 
                                href="#" 
                                onClick={(e) => { 
                                    e.preventDefault(); 
                                    setResetPassword(true); 
                                }}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                ¿Olvidaste tu contraseña?
                            </a>
                        </p>
                    </form>
                ) : (
                    <form onSubmit={handlePasswordReset} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="reset-email" className="font-medium text-sm text-gray-700">
                                Email
                            </label>
                            <input
                                id="reset-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="tu@email.com"
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            className={`mt-2 py-2 px-4 rounded-md font-medium text-white ${
                                loading 
                                    ? 'bg-blue-400 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                            }`}
                            disabled={loading}
                        >
                            {loading ? 'Enviando...' : 'Enviar correo de restablecimiento'}
                        </button>
                        
                        <p className="text-center text-sm mt-4">
                            <a 
                                href="#" 
                                onClick={(e) => { 
                                    e.preventDefault(); 
                                    setResetPassword(false); 
                                }}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                Volver al inicio de sesión
                            </a>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
};