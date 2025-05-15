// src/components/Aviso.tsx
import React, { useEffect } from 'react';
import './styles/Aviso.css';

type AvisoProps = {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
};

const Aviso: React.FC<AvisoProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000); // Fecha após 3 segundos

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`toast ${type}`}>
            {message}
        </div>
    );
};

export default Aviso;
