import MainNav from "../components/MainNav";
import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate, Link } from "react-router-dom";


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault()
    const { error } = await  supabase.auth.signInWithPassword({email, password})
    if (error) {
      setError(error.message);
    } else {
      setError('')
      navigate('/dashboard')
    }
  }

  return (
    <>
    <div  className="form-page">
      <div className="center-container">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Login</h2>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          <Link to="/register" className="link">Don't have an account? Sign up here</Link>
          <button type="submit">Login</button>
          <Link to="/forgot-password" className="link">Forgot Password?</Link>
          {error.length > 0 && <p>{error}</p>}
        </form>
      </div>
    </div>
    </>
  );
}
