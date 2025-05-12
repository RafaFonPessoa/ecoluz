import { LoginForm } from '../components/LoginForm';
import './styles/login-style.css'

export function Login(){
    return(
        <>
        <div id='container-login-form'>
            <LoginForm></LoginForm>
        </div>
        </>
    );
}