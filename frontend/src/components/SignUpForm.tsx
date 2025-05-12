import { Link } from "react-router-dom";
import './styles/signupformstyle.css';
import logo from '../pages/logoEcoluz.png';
import { useState } from "react";
import Toast from './Aviso';

export function SignUpForm() {
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const email = (document.getElementById("email") as HTMLInputElement).value;
        const password1 = (document.getElementById("password") as HTMLInputElement).value;
        const password2 = (document.getElementById("confirm-password") as HTMLInputElement).value;

        if (!email || !password1 || !password2) {
            setToast({ message: "Preencha todos os campos.", type: 'error' });
            return;
        }

        if (password1.length < 6) {
            setToast({ message: "A senha é muito curta. A senha deve ter no minimo 6 caracteres!", type: 'error' });
            return;
        }

        if (password1 !== password2) {
            setToast({ message: "As senhas não são a mesma! Tente novamente.", type: 'error' });
            return;
        }

        // Simulação de cadastro bem-sucedido
        setToast({ message: "Cadastro realizado com sucesso!", type: 'success' });
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
