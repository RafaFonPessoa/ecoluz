import logo from '../pages/logoEcoluz.png'
import './styles/navbar.css'

export function Navbar() {
    return(
        <>
            <div className="container-navbar">
                <img src={logo} alt="logoEcoluz"  id="logo"/>
                <div id="container-searchbar">
                    <label htmlFor="">Busque seus eletrodomesticos aqui!</label>
                    <input type="search" name="" id="searchbar" />
                </div>
                <button><a href="/">Sair do Ecoluz</a></button>
            </div>
        </>
    )
}