import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from "react-icons/fi";
import Modal from '../components/Modal';

export default function Register() {
    const [email, setEmail] =  useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false)
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

         if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (!email || !password || !firstName || !lastName) {
            setError('Please fill in all fields.');
            return;
        }

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
            setShowModal(true)
        }      
    };

    return(
        <>
        <Modal
            isOpen={showModal}
            message={'Registration complete! Please check your email inbox and confirm.'}
            onClose={ () => {
                setShowModal(false)
                navigate('/login')
            }}
        />
        <div className="layout-wrapper">
        <div className="form-page">
            <div className="center-container">
                <form onSubmit={handleRegister} className='login-form'>
                <h2>Register</h2>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder='FirstName'/>
                <input value={lastName} onChange={(e) => {setLastName(e.target.value)}} placeholder='LastName' />
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
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

                <p>Already have an account? <Link className="link" to="/login">Login here</Link></p>
                <button type="submit">Register</button>
                {error.length > 0 && <p>{error}</p>}
                </form>
            </div>
        </div>
        </div>
        </>
    );
}