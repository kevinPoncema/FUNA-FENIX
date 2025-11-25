import React from 'react';
import { Zap, User, ChevronsUp } from 'lucide-react';

/**
 * Componente Header de la aplicación
 */
const Header = () => {
    return (
        <header className="text-center mb-8 bg-black/40 p-4 rounded-xl shadow-2xl">
            <h1 className="text-5xl font-extrabold text-green-300 tracking-wider font-serif">
                Retrospectiva de Equipo
            </h1>
            <p className="text-xl text-white/90 mt-2">
                La Pizarra del Crecimiento (Acciones, Esenciales, Potencial)
            </p>
            {/* Títulos de Categoría en la cabecera (para guía visual) */}
            <div className="mt-4 flex justify-center gap-10 text-lg font-bold text-white/90">
                <span className="text-green-300 flex items-center gap-1">
                    <Zap size={16}/> Logros
                </span>
                <span className="text-yellow-200 flex items-center gap-1">
                    <User size={16}/> Cualidades
                </span>
                <span className="text-cyan-300 flex items-center gap-1">
                    <ChevronsUp size={16}/> Potencial
                </span>
            </div>
        </header>
    );
};

export default Header;
