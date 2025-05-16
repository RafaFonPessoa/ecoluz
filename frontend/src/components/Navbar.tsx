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
    navigate('/usuario'); // Redireciona para a página do usuário
  };

  return (
    <div className="container-navbar">
      <h3>Eco Luz</h3>
      <div className="navbar-links">
        <span className="menu-link" onClick={() => navigate('/ecoluz')}>Tela Inicial</span>
        <span className="menu-link" onClick={() => navigate('/ecoluz/calc')}>Cálculo Consumo</span>
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
