import React from 'react';
import logo from './logo.svg';
import './App.css';
import {HashRouter as Router, Routes, Route} from 'react-router-dom'
import {Login} from './pages/login'
import {SignUp} from './pages/sign-up'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login/>}></Route>
        <Route path="/cadastro" element={<SignUp/>}></Route>
      </Routes>
    </Router>
  );
}

export default App;
