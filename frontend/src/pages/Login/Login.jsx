import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';

import { useAuth } from '../../context/AuthContext';
import redLogo from '../../assets/REDmatalogo.png';
import whiteLogo from '../../assets/WHITEmatalogo.png';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (login) {
        await login({ googleToken: credentialResponse.credential });
      }
      setError(false);
      navigate('/dashboard');
    } catch (err) {
      console.error('Google login failed in context:', err);
      setError(true);
    }
  };

  const handleGoogleError = () => {
    console.error('Google Auth Failed');
    setError(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.endsWith('@my.csun.edu') && !email.endsWith('@csun.edu')) {
      setError(true);
      return;
    }

    try {
      setError(false);
      if (login) {
        await login({ email, password });
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Standard login failed:', err);
      setError(true);
    }
  };

  return (
    <>
      <style>{`
        .screen-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          min-height: calc(100vh - 80px);
          padding: 20px;
          box-sizing: border-box;
          background-color: #ffffff;
        }

        .page-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 400px;
        }

        .outer-logo-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 16px;
        }

        .outer-logo-image {
          display: block;
          max-width: 110px;
          height: auto;
          object-fit: contain;
        }

        h1 {
          font-family: Helvetica, Arial, sans-serif;
          font-size: 28px;
          color: #111;
          margin-bottom: 24px;
          text-align: center;
        }

        .logo-container {
          width: 100%;
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .logo-image {
          display: block;
          max-width: 90px;
          height: auto;
          object-fit: contain;
        }

        .login-container {
          background: linear-gradient(135deg, #680207, #ff7075);
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          width: 100%;
          box-sizing: border-box;
          color: #ffffff;
        }

        h2 {
          text-align: center;
          margin-bottom: 24px;
          font-family: Helvetica, Arial, sans-serif;
          font-size: 22px;
          color: #ffffff;
        }

        .google-btn-wrapper {
          display: flex;
          justify-content: center;
          width: 100%;
          margin-bottom: 18px;
        }

        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          color: rgba(255, 255, 255, 0.8);
          font-size: 13px;
          margin: 18px 0;
          font-family: Helvetica, Arial, sans-serif;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
        }

        .divider::before {
          margin-right: 12px;
        }

        .divider::after {
          margin-left: 12px;
        }

        .input-group {
          margin-bottom: 20px;
          text-align: left;
        }

        .input-group label {
          display: block;
          font-family: Helvetica, Arial, sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 6px;
        }

        input {
          width: 100%;
          padding: 12px;
          border: 1px solid transparent;
          border-radius: 6px;
          box-sizing: border-box;
          font-size: 14px;
          background-color: #ffffff;
          color: #111111;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        input:focus {
          outline: none;
          border-color: #111111;
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.2);
        }

        .error-message {
          color: #ffdddd;
          background-color: rgba(0, 0, 0, 0.2);
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 13px;
          margin-top: -10px;
          margin-bottom: 16px;
          font-weight: bold;
          font-family: Helvetica, Arial, sans-serif;
        }

        input.invalid-field {
          border-color: #ffcccc;
          background-color: #fff5f5;
        }

        .login-btn {
          width: 100%;
          padding: 12px;
          background-color: #111111;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: background-color 0.2s ease;
        }

        .login-btn:hover {
          background-color: #ff0000;
        }

        .register-text {
          margin-top: 24px;
          font-family: Helvetica, Arial, sans-serif;
          font-size: 14px;
          color: #555555;
          text-align: center;
        }

        .register-text a {
          color: #C10006;
          text-decoration: none;
          font-weight: 600;
        }

        .register-text a:hover {
          text-decoration: underline;
        }
      `}</style>

      <main className="screen-container">
        <motion.div
          className="page-wrapper"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >

          <div className="login-container">
            <div className="logo-container">
              <img
                src={whiteLogo}
                alt="MataPool White Logo"
                className="logo-image"
              />
            </div>

            <h2>Log In</h2>

            <div className="google-btn-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                shape="rectangular"
                theme="outline"
              />
            </div>

            <div className="divider">or continue with email</div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="email">CSUN email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="example.123@my.csun.edu"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={error ? 'invalid-field' : ''}
                />
              </div>

              {error && (
                <div className="error-message">
                  Please log in using only your official CSUN student email.
                </div>
              )}

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="login-btn"
              >
                Sign In
              </motion.button>
            </form>
          </div>

          <p className="register-text">
            Don&apos;t have an account?{' '}
            <Link to="/register">Create an account</Link>
          </p>
        </motion.div>
      </main>
    </>
  );
}

export default Login;