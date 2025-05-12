import { useNavigate } from 'react-router-dom';
import logo from '../pages/logoEcoluz.png';
import accountIcon from './styles/account.png'; // Certifique-se de que o caminho está correto
import logoutIcon from './styles/logout.png'; // Certifique-se de que o caminho está correto
import './styles/navbar.css';

export function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // Limpa os dados de autenticação
    navigate('/'); // Redireciona para a página inicial
  };

  const handleAccountRedirect = () => {
    navigate('/user'); // Redireciona para a página do usuário
  };

  return (
    <div className="container-navbar">
      <img src={logo} alt="logoEcoluz" id="logo" />
      <div id="container-searchbar">
        <label htmlFor="">Busque seus eletrodomésticos aqui!</label>
        <input type="search" name="" id="searchbar" />
      </div>
      <div className="navbar-icons">
        <img 
          src={accountIcon} 
          alt="Account" 
          onClick={handleAccountRedirect} 
          style={{ cursor: 'pointer', marginLeft: '10px' }} 
        />
        <img 
          src={logoutIcon} 
          alt="Logout" 
          onClick={handleLogout} 
          style={{ cursor: 'pointer', marginLeft: '10px' }} 
        />
      </div>
    </div>
  );
}
