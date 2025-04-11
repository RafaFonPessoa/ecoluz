import { Link } from "react-router-dom";
import './styles/signupformstyle.css'

function signUpUser(event: React.FormEvent) {
    event.preventDefault(); 

    let password1 = (document.getElementById("password") as HTMLInputElement).value;
    let password2 = (document.getElementById("confirm-password") as HTMLInputElement).value;

    if (password1 !== '' && password2 !== ''){
        if (password1.length < 6) {
            alert("A senha é muito curta. A senha deve ter no minimo 6 caracteres!")
        }
        if (password1 !== password2) {
            alert("As senhas não são a mesma! Tente novamente.");
            return;
        }
    }
}

export function SignUpForm() {
    return (
        <>
            <div className="container-signup-form">
                <div className="signup-form-div">
                    <form className="signup-form" onSubmit={signUpUser}>
                        <h2>CADASTRO</h2>
                        <label htmlFor="">
                            Email:
                            <br />
                            <input type="email" id="email" placeholder='seuemail@email.com' />
                        </label>
                        <label htmlFor="">
                            Senha:
                            <br />
                            <input type="password" id="password" placeholder='********' />
                        </label>

                        <label htmlFor="">
                            Confirmar Senha:
                            <br />
                            <input type="password" id="confirm-password" placeholder='********' />
                        </label>
                        <button type="submit">Cadastrar</button>
                        <label htmlFor="">
                            Já tem uma conta? <Link to="/"> Faça Login.</Link>
                        </label>
                    </form>
                </div>
            </div>
        </>
    );
}
