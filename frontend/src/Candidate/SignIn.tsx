import React, { useState } from 'react';
import '../global.css';
import { supabase } from '../supabaseClient'; 
import { useNavigate } from 'react-router-dom'; 

import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiUser,
} from 'react-icons/fi';

import { FcGoogle } from 'react-icons/fc';
import { FaLinkedin } from 'react-icons/fa';

import logo from '../../assets/logo.png';

const SignIn = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  
  // Supabase Auth States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

    // Authentication Logic
  const handleAuth = async (e: React.FormEvent) => {
  e.preventDefault();
  
if (activeTab === 'signup') {
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: { data: { full_name: fullName } } 
  });

  if (error) {
    alert(error.message);
    return; 
  } 

  await supabase.auth.signOut();
  
  alert('Sign up successful! Please check your email for confirmation.');
  setActiveTab('signin'); 

  } else {
    // 2. Sign In Logic
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (error) {
      alert(error.message);
      return;
    }

    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        alert("Error fetching user profile: " + profileError.message);
        return;
      }

      if (profile?.role === 'admin') {
        navigate('/admin/dashboard'); 
      } else {
        navigate('/candidate/dashboard'); 
      }
    }
  }
};
  return (
    <div className="auth-container">
      {/* LEFT SIDE */}
      <div className="auth-left">
        <div className="wave-bg"></div>
        <div className="top-logo">
          <img src={logo} alt="Logo" />
          <span>WORKFORCE HIRING SOLUTIONS</span>
        </div>
        <div className="left-content">
          <h1>Join Our <br /> <span>Global Talent</span> <br /> Network</h1>
          <p>Build your professional profile and get matched with future opportunities from our hiring partners.</p>
          <div className="feature-grid">
            <div className="feature-card"><div className="icon-box">🛡️</div><div><h4>Verified Profile</h4><p>Your profile is verified and trusted by recruiters</p></div></div>
            <div className="feature-card"><div className="icon-box">🌍</div><div><h4>Global Opportunities</h4><p>Access opportunities from top companies worldwide</p></div></div>
            <div className="feature-card"><div className="icon-box">🔍</div><div><h4>Faster Recruiter Reach</h4><p>Get discovered by recruiters looking for talent</p></div></div>
            <div className="feature-card"><div className="icon-box">🔒</div><div><h4>Secure & Confidential</h4><p>Your data is protected and confidential</p></div></div>
          </div>
        </div>
        <div className="bottom-indicator">
          <p>Your next opportunity starts here.</p>
          <div className="dots"><span className="active"></span><span></span><span></span></div>
        </div>
      </div>

      {/* RIGHT SIDE: Dynamic Form */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="card-logo"><img src={logo} alt="Logo" /></div>
          <h2>{activeTab === 'signin' ? 'Welcome' : 'Create Account'}</h2>
          <small>{activeTab === 'signin' ? 'Join our candidate pool' : 'Join our global candidate pool'}</small>

          <div className="tabs">
            <button className={activeTab === 'signin' ? 'active-tab' : ''} onClick={() => setActiveTab('signin')}>Sign In</button>
            <button className={activeTab === 'signup' ? 'active-tab' : ''} onClick={() => setActiveTab('signup')}>Sign Up</button>
          </div>

          <form className="auth-form" onSubmit={handleAuth}>
            {activeTab === 'signup' && (
              <div className="input-group">
                <FiUser className="input-icon" />
                <input type="text" placeholder="Full Name" required onChange={(e) => setFullName(e.target.value)} />
              </div>
            )}
            <div className="input-group">
              <FiMail className="input-icon" />
              <input type="email" placeholder="Email Address" required onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="input-group">
              <FiLock className="input-icon" />
              <input type={showPassword ? 'text' : 'password'} placeholder="Password" required onChange={(e) => setPassword(e.target.value)} />
              <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            <button type="submit" className="submit-btn">{activeTab === 'signin' ? 'Sign In' : 'Create Account'}</button>
          </form>

          <div className="divider"><span></span><p>or continue with</p><span></span></div>
          <div className="social-buttons">
            <button type="button"><FcGoogle /></button>
            <button type="button"><FaLinkedin style={{ color: '#0a66c2' }} /></button>
          </div>

          <div className="footer-text">
            {activeTab === 'signin' ? (
              <>New to our network? <span className="auth-link-span" onClick={() => setActiveTab('signup')}>Sign up here</span></>
            ) : (
              <>Already have an account? <span className="auth-link-span" onClick={() => setActiveTab('signin')}>Sign in here</span></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;