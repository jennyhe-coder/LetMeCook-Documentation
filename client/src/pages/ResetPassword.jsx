import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        const {error} = await supabase.auth.updateUser({password});
        if (error) {
            setError(error.message);
            return;
        }
        alert('Password has been successfully reset. You can now log in with your new password.');
        setPassword('');
        navigate('/');
    };

    return(
        <div className='form-page'>
        <form onSubmit={handleResetPassword} className="login-form">
            <h2>Reset Password</h2>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
            />
            <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
            />
            <button type="submit">Reset Password</button>
            {error && <p className="error-message">{error}</p>}
        </form>
        </div>
    );
}