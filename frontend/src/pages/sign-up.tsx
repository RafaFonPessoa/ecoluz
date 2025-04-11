import logo from './logoEcoluz.png';
import { SignUpForm } from '../components/SignUpForm';
import './styles/signup-style.css'
export function SignUp() {
    return (
        <div id="container-signup-form">
            <SignUpForm />
            <img src={logo} alt="logoEcoLuz" className="signup-logo" />
        </div>
    );
}