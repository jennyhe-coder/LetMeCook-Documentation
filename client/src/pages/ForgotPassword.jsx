import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleResetPassword = async (e) => {
        e.preventDefault();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password'
        });
        
        if (error) {
            setError(error.message);
            return;
        }
        
        alert('Password reset email sent! Please check your inbox.');
    };

    return (
        <div className="form-page">
        <div className="center-container">
            <form onSubmit={handleResetPassword} className='login-form'>
                <h2>Forgot Password</h2>
                <p>Enter your email address to receive a password reset link.</p>
                <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Enter your email" 
                    required 
                />
                <button type="submit">Send Reset Email</button>
                {error && <p>{error}</p>}
            </form>
            </div>
        </div>
    );
}