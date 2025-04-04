import { Link } from "react-router";
import './styles/loginfromstyle.css'

export function LoginForm() {
    return (
        <>
            <div className="container-login-form">
                <div className='login-form-div'>
                    <form className="login-form">
                        <h2>LOGIN</h2>  
                        <label htmlFor="">
                            Email:
                            <br />
                            <input type="text" placeholder='seuemail@email.com'/>
                        </label>
                        <label htmlFor="">
                            Senha: 
                            <br />
                            <input type="text" placeholder='********'/>
                        </label>
                        <button>Entrar</button>
                        <label htmlFor="">
                            Não tem conta? <Link to="/cadastro">Crie conta agora!</Link>
                        </label>
                        
                    </form>
                </div>
            </div>
        </>
    );
}