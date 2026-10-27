import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateAuth } from '../utils/validate';

export default function AuthPage({ mode }) {
  const isReg = mode === 'register';
  const { login, register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ email: '', password: '', repeat: '' });
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState('');
  const [info, setInfo] = useState('');
  const set = (e) => setF({ ...f, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const errs = validateAuth(f, isReg);
    setErrors(errs); setFailure(''); setInfo('');
    if (Object.keys(errs).length) return;
    try {
      if (isReg) { (await register(f.email.trim(), f.password)) ? nav('/recipes') : setInfo('Check your inbox and confirm your email, then log in.'); }
      else { await login(f.email.trim(), f.password); nav('/recipes'); }
    } catch (err) { setFailure(err.message); }
  }
  return (<>
    <h1>{isReg ? 'Join PotLuck' : 'Log in'}</h1>
    <form onSubmit={submit} noValidate className="form">
      <label className="field">Email<input name="email" type="email" value={f.email} onChange={set} />{errors.email && <span className="err">{errors.email}</span>}</label>
      <label className="field">Password<input name="password" type="password" value={f.password} onChange={set} />{errors.password && <span className="err">{errors.password}</span>}</label>
      {isReg && <label className="field">Repeat password<input name="repeat" type="password" value={f.repeat} onChange={set} />{errors.repeat && <span className="err">{errors.repeat}</span>}</label>}
      {failure && <div className="error" role="alert">{failure}</div>}{info && <div className="ok" role="status">{info}</div>}
      <button className="btn">{isReg ? 'Create account' : 'Log in'}</button>
    </form>
    <p className="note">{isReg ? <>Have an account? <Link to="/login">Log in</Link></> : <>New here? <Link to="/register">Join PotLuck</Link></>}</p>
  </>);
}
