import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="card form auth" onSubmit={submit}>
      <h2>Create account</h2>
      {error && <p className="alert">{error}</p>}
      <label>Name<input required value={form.name} onChange={set('name')} /></label>
      <label>Email<input type="email" required value={form.email} onChange={set('email')} /></label>
      <label>Password (min 6 characters)<input type="password" minLength={6} required value={form.password} onChange={set('password')} /></label>
      <button className="btn full">Sign up</button>
      <p className="muted">Already registered? <Link to="/login">Login</Link></p>
    </form>
  );
}
