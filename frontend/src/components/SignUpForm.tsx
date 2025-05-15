import { Link } from "react-router-dom";
import './styles/signupformstyle.css';
import logo from '../pages/logoEcoluz.png';
import { useState } from "react";
import Toast from './Aviso';

export function SignUpForm() {
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const email = (document.getElementById("email") as HTMLInputElement).value;
        const password1 = (document.getElementById("password") as HTMLInputElement).value;
        const password2 = (document.getElementById("confirm-password") as HTMLInputElement).value;

        // Verifica se os campos estão preenchidos
        if (!email || !password1 || !password2) {
            setToast({ message: "Preencha todos os campos.", type: 'error' });
            return;
        }

        // Verifica se a senha é muito curta
        if (password1.length < 6) {
            setToast({ message: "A senha é muito curta. A senha deve ter no minimo 6 caracteres!", type: 'error' });
            return;
        }

        // Verifica se as senhas são iguais
        if (password1 !== password2) {
            setToast({ message: "As senhas não são a mesma! Tente novamente.", type: 'error' });
            return;
        }

        try {
            // Envia os dados para a API
            const response = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, senha: password1 })
            });

            const data = await response.json();

            // Verifica se o cadastro foi bem-sucedido
            if (response.ok) {
                setToast({ message: "Cadastro realizado com sucesso!", type: 'success' });
            } else {
                setToast({ message: data.mensagem || "Erro no cadastro.", type: 'error' });
            }
        } catch (error) {
            setToast({ message: "Erro na conexão com o servidor.", type: 'error' });
        }
    };

    return (
        <>
            <div className="container-signup-form">
                <img src={logo} alt="logoEcoLuz" className="signup-logo" />
                <div className="signup-form-div">
                    <form className="signup-form" onSubmit={handleSubmit}>
                        <h2>CADASTRO</h2>
                        <label>
                            Email:
                            <br />
                            <input type="email" id="email" placeholder='seuemail@email.com' required />
                        </label>
                        <label>
                            Senha:
                            <br />
                            <input type="password" id="password" placeholder='********' required />
                        </label>

                        <label>
                            Confirmar Senha:
                            <br />
                            <input type="password" id="confirm-password" placeholder='********' required />
                        </label>
                        <button type="submit">Cadastrar</button>
                        <label>
                            Já tem uma conta? <Link to="/"> Faça Login.</Link>
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
