import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Componente para mostrar errores
 */
const ErrorDisplay = ({ error }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-800/90 text-white p-8">
            <AlertTriangle size={64} className="mb-4 text-yellow-300" />
            <h1 className="text-3xl font-extrabold">¡ERROR CRÍTICO!</h1>
            <p className='text-xl mt-2'>No se pudo cargar la aplicación.</p>
            <p className='mt-4 p-4 bg-red-900/50 rounded-lg border border-yellow-300'>
                <span className='font-bold'>Mensaje:</span> {error}
            </p>
            <p className='mt-4 text-sm'>
                Por favor, abre la consola (F12) y revisa los logs de depuración de Firebase (<span className='text-yellow-300'>[firestore/debug]</span>) para la causa exacta.
            </p>
        </div>
    );
};

export default ErrorDisplay;
