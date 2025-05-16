import React from 'react';
import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import {Login} from './pages/login'
import {User} from './pages/user'
import {SignUp} from './pages/sign-up'
import {MainPage} from './pages/main-page';
import {CalculationPage} from './pages/calculation-page'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login/>}></Route>
        <Route path="/cadastro" element={<SignUp/>}></Route>
        <Route path="/ecoluz" element={<MainPage/>}></Route>
        <Route path="/ecoluz/calc" element={<CalculationPage/>}></Route>
        <Route path="/usuario" element={<User/>}></Route>
      </Routes>
    </Router>
  );
}

export default App;
