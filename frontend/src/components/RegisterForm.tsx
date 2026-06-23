import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './AuthForms.css';

interface RegisterFormProps {
  onSuccess?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellidos: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register, isLoading } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await register(formData);
      setSuccess(true);
      onSuccess?.();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError('El email ya está registrado');
      } else if (err.response?.status === 422) {
        setError('Datos de entrada inválidos');
      } else {
        setError(err.response?.data?.error || 'Error al registrar usuario');
      }
    }
  };

  if (success) {
    return (
      <div className="auth-form success-message">
        <h2>¡Registro Exitoso!</h2>
        <p>Tu cuenta ha sido creada correctamente.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Registro</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="nombre">Nombre</label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          placeholder="Tu nombre"
        />
      </div>

      <div className="form-group">
        <label htmlFor="apellidos">Apellidos</label>
        <input
          type="text"
          id="apellidos"
          name="apellidos"
          value={formData.apellidos}
          onChange={handleChange}
          required
          placeholder="Tus apellidos"
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="tu@email.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Contraseña</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      <button type="submit" disabled={isLoading} className="submit-button">
        {isLoading ? 'Registrando...' : 'Registrarse'}
      </button>
    </form>
  );
};

export default RegisterForm;
