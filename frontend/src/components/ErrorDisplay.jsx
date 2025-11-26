import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Componente para mostrar errores
 */
const ErrorDisplay = ({ error, onRetry }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-800/90 text-white p-8">
            <AlertTriangle size={64} className="mb-4 text-yellow-300" />
            <h1 className="text-3xl font-extrabold">¡ERROR!</h1>
            <p className='text-xl mt-2'>No se pudo cargar la aplicación.</p>
            <p className='mt-4 p-4 bg-red-900/50 rounded-lg border border-yellow-300 max-w-2xl'>
                <span className='font-bold'>Mensaje:</span> {error}
            </p>
            {onRetry && (
                <button 
                    onClick={onRetry}
                    className="mt-6 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                >
                    <RefreshCw size={20} />
                    Retry
                </button>
            )}
            <p className='mt-4 text-sm text-gray-300'>
                Verifica que el backend esté ejecutándose en http://localhost:8000
            </p>
        </div>
    );
};

export default ErrorDisplay;
