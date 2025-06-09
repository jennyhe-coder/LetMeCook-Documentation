import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const [email, setEmail] =  useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        console.log({
  email,
  password,
  options: {
    data: {
      first_name: firstName,
      last_name: lastName
    }
  }
});
        const {data, error} = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName
                }
            }
        });

        if (error) {
            setError(error.message);
            return
        }

        if(!data.user?.id) {
            setError("No user Id returned");
            return;
        } else {
        alert('Registration complete! Please check your email inbox and confirm.');
        navigate('/login');
    }      
};

    return(
        <>
        <div className="layout-wrapper">
            <h1>Register Page</h1>
            <form onSubmit={handleRegister}>
            <h2>Register</h2>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder='FirstName'/>
            <input value={lastName} onChange={(e) => {setLastName(e.target.value)}} placeholder='LastName' />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            <button type="submit">Register</button>
            {error.length > 0 && <p>{error}</p>}
            </form>
        </div>
        </>
    );
}