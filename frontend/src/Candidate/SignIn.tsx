// src/Candidate/SignIn.tsx
import React, { useState, useEffect } from 'react';
import '../global.css';
import { supabase } from '../supabaseClient';
import { useNavigate, useLocation, Link } from 'react-router-dom'; 

import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiUser,
} from 'react-icons/fi';

import { FcGoogle } from 'react-icons/fc';
import { FaLinkedin } from 'react-icons/fa';
import { logLogin } from '../utils/activityLogger';
import logo from '../../assets/logo.png';

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Get redirect path from URL params
  const getRedirectPath = () => {
    const params = new URLSearchParams(location.search);
    return params.get('redirect') || '/candidate/candidate-dashboard';
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const redirectPath = getRedirectPath();
    
    if (activeTab === 'signup') {
      // Sign Up
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { 
          data: { 
            full_name: fullName
          } 
        } 
      });

      if (error) {
        alert(error.message);
        setLoading(false);
        return; 
      } 

      if (data.user) {
        alert('Sign up successful! Please check your email for confirmation.');
        setActiveTab('signin');
        setEmail('');
        setPassword('');
        setFullName('');
      }
      setLoading(false);

    } else {
      // Sign In
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        await logLogin(email);
        // Get user role from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          navigate(redirectPath);
        } else if (profile?.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate(redirectPath);
        }
      }
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const redirectPath = getRedirectPath();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${redirectPath}`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleLinkedInSignIn = async () => {
    try {
      const redirectPath = getRedirectPath();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}${redirectPath}`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="auth-container">
      {/* LEFT SIDE */}
      <div className="auth-left">
        <div className="wave-bg"></div>
        <div className="top-logo">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <img src={logo} alt="Logo" />
            <span>WORKFORCE HIRING SOLUTIONS</span>
          </Link>
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
          <div className="card-logo">
            <Link to="/">
              <img src={logo} alt="Logo" />
            </Link>
          </div>
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
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  required 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)} 
                />
              </div>
            )}
            <div className="input-group">
              <FiMail className="input-icon" />
              <input 
                type="email" 
                placeholder="Email Address" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div className="input-group">
              <FiLock className="input-icon" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
              />
              <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Loading...' : (activeTab === 'signin' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="divider"><span></span><p>or continue with</p><span></span></div>
          <div className="social-buttons">
            <button type="button" onClick={handleGoogleSignIn}><FcGoogle /></button>
            <button type="button" onClick={handleLinkedInSignIn}><FaLinkedin style={{ color: '#0a66c2' }} /></button>
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