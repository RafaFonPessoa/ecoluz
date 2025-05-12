import { Link } from "react-router";
import './styles/loginfromstyle.css';
import logo from '../pages/logoEcoluz.png';
import React, { useState } from 'react';
import Toast from './Aviso';

export function LoginForm() {
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Aqui você pode adicionar a lógica real de autenticação
        const isLoginValid = false; // Simulação

        if (isLoginValid) {
            setToast({ message: 'Login bem-sucedido!', type: 'success' });
        } else {
            setToast({ message: 'Email ou senha inválidos.', type: 'error' });
        }
    };

    return (
        <>
            <div className="container-login-form">
                <img src={logo} alt='logoEcoluz'/>
                <div className='login-form-div'>
                    <form className="login-form" onSubmit={handleSubmit}>
                        <h2>ENTRAR</h2>  
                        <label>
                            Email:
                            <br />
                            <input type="email" placeholder='seuemail@email.com' required />
                        </label>
                        <label>
                            Senha: 
                            <br />
                            <input type="password" placeholder='********' required />
                        </label>
                        <button type="submit">Entrar</button>
                    <label>
                        Não tem conta? <Link to="/cadastro">Crie conta agora!</Link>
                    </label>
                    </form>
                </div>
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </>
    );
}
