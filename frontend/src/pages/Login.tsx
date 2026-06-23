import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import './AuthPages.css';

const Login: React.FC = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Quick Shop</h1>
        <LoginForm />
        <p className="auth-link">
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
