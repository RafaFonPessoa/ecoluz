import { LoginForm } from '../components/LoginForm';
import './styles/login-style.css'
import logo from './logoEcoluz.png'

export function Login(){
    return(
        <>
        <div id='container-login-form'>
            <LoginForm></LoginForm>
            <img src={logo} alt='logoEcoluz'/>
        </div>
        </>
    );
}