import React from 'react';
import { Zap, User, ChevronsUp } from 'lucide-react';

/**
 * Componente Header de la aplicación
 */
const Header = () => {
    return (
        <header className="retrospective-header">
            <h1 className="retrospective-title">
                Retrospectiva de Equipo
            </h1>
            <p className="retrospective-subtitle">
                La Pizarra del Crecimiento (Acciones, Esenciales, Potencial)
            </p>
            
            {/* Navegación de categorías horizontal sin bordes */}
            <div className="flex justify-center gap-8 mt-6">
                <div className="flex items-center gap-2 text-green-400 font-semibold">
                    <Zap size={20} /> 
                    <span>Logros</span>
                </div>
                <div className="flex items-center gap-2 text-yellow-400 font-semibold">
                    <User size={20} /> 
                    <span>Cualidades</span>
                </div>
                <div className="flex items-center gap-2 text-blue-400 font-semibold">
                    <ChevronsUp size={20} /> 
                    <span>Potencial</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
