import React from 'react';
import { Zap } from 'lucide-react';

/**
 * Componente de carga
 */
const Loading = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#2f5b40] text-white/90 p-8">
            <Zap size={48} className="animate-spin mr-2 text-green-300" />
            <h1 className='text-3xl mt-4 font-bold'>Cargando Tablero...</h1>
            <p className='mt-2 text-lg'>Autenticando usuario y conectando a la pizarra de Firebase.</p>
        </div>
    );
};

export default Loading;
