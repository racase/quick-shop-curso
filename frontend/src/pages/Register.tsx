import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';
import './AuthPages.css';

const Register: React.FC = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Quick Shop</h1>
        <RegisterForm />
        <p className="auth-link">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
