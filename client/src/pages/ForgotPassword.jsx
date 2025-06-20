import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';


export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false)
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password'
        });
        
        if (error) {
            setError(error.message);
            return;
        }
        setShowModal(true)        
    };

    return (
        <>
        <Modal
            isOpen ={showModal}
            message = {"Password reset email sent! Please check your inbox."}
            onClose = {() => {
                setShowModal(false)
                navigate('/')
            }}
        />
        <div className="layout-wrapper">
        <div className="form-page">
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
        </>
    );
}