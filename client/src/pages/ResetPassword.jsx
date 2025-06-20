import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import Modal from '../components/Modal';
export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false)
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
        setShowModal(true)
        setPassword('');
    };

    return(
        <>
        <Modal
            isOpen = {showModal}
            message = {'Password has been successfully reset. You can now log in with your new password.'}
            onClose = { () => {
                setShowModal(false)
                navigate('/')
            }}
        />
        <div className="layout-wrapper">
        <div className='form-page'>
            <div className='center-container'>
                <form onSubmit={handleResetPassword} className="login-form">
                    <h2>Reset Password</h2>
                    <div className="password-wrapper">
                        <input type={showPassword ? "text" : "password" } 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Password" 
                        />
                        <span className="flex justify-around items-center" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ?  <FiEye className="input-icon" size={25} /> : <FiEyeOff className="input-icon" size={25} />}
                        </span>
                    </div>
                    <div className='password-wrapper'>
                        <input
                        type={showConfirmPassword ? "text" : "password" }
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        required
                        />
                        <span className="flex justify-around items-center" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ?  <FiEye className="input-icon" size={25} /> : <FiEyeOff className="input-icon" size={25} />}
                        </span>
                    </div>
                    <button type="submit">Reset Password</button>
                    {error && <p className="error-message">{error}</p>}
                </form>
            </div>
        </div>
        </div>
        </>
    );
}