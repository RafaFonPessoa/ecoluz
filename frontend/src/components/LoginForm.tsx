import { Link, useNavigate } from "react-router-dom";
import './styles/loginfromstyle.css';
import logo from '../pages/logoEcoluz.png';
import React, { useState } from 'react';
import Toast from './Aviso';

export function LoginForm() {
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const email = (document.getElementById("email") as HTMLInputElement).value;
        const password = (document.getElementById("password") as HTMLInputElement).value;

        // Verifica se os campos estão preenchidos
        if (!email || !password) {
            setToast({ message: "Preencha todos os campos.", type: 'error' });
            return;
        }

        try {
            // Envia os dados para a API de login
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, senha: password })
            });

            const data = await response.json();

            // Verifica se o login foi bem-sucedido
            if (response.ok) {
                // Armazena o token JWT no localStorage
                localStorage.setItem("token", data.token);

                // Exibe mensagem de sucesso
                setToast({ message: "Login bem-sucedido!", type: 'success' });

                localStorage.setItem('userId', data.userId);
                console.log(localStorage)
                navigate("/ecoluz"); // Altere para a página desejada após o login
            } else {
                setToast({ message: data.mensagem || "Erro no login.", type: 'error' });
            }
        } catch (error) {
            setToast({ message: "Erro na conexão com o servidor.", type: 'error' });
        }
    };

    return (
        <>
            <div className="container-login-form">
                <img src={logo} alt="logoEcoluz" />
                <div className="login-form-div">
                    <form className="login-form" onSubmit={handleSubmit}>
                        <h2>ENTRAR</h2>
                        <label>
                            Email:
                            <br />
                            <input type="email" id="email" placeholder="seuemail@email.com" required />
                        </label>
                        <label>
                            Senha:
                            <br />
                            <input type="password" id="password" placeholder="********" required />
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
