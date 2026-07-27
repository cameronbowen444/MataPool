import React, { useState } from 'react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate official CSUN student email
    if (!email.endsWith('@my.csun.edu') && !email.endsWith('@csun.edu')) {
      setError(true);
      return;
    }

    setError(false);
    console.log('Logging in with:', { email, password });
  };

  return (
    <>
      <style>{`
        .screen-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          padding: 20px 0;
          box-sizing: border-box;
        }

        .page-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 400px;
        }

        .logo-container {
          width: 100%;
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }

        .logo-image {
          display: block;
          max-width: 100px;
          height: auto;
          object-fit: contain;
        }

        .login-container {
          background-color: #fff;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          width: 100%;
          box-sizing: border-box;
        }

        h2 {
          text-align: center;
          margin-bottom: 24px;
          font-family: Helvetica;
          font-size: 30px;
          color: #000;
        }

        .input-group {
          margin-bottom: 20px;
          font-family: Helvetica;
          text-align: left;
        }

        .input-group label {
        display: block; 
        text-align: left;
        font-family: Helvetica;
        font-size: 14px; /* Optional: change label font size */
        font-weight: 600; /* Makes label text crisp */
        }

        input {
          width: 100%;
          padding: 12px;
          margin-top: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-sizing: border-box;
        }

        .error-message {
          color: #C10006;
          font-size: 13px;
          margin-top: -12px;
          margin-bottom: 16px;
          font-weight: bold;
          font-family: Helvetica, Arial, sans-serif;
        }

        input.invalid-field {
          border-color: #C10006;
          background-color: #fff8f8;
        }

        .login-btn {
          width: 100%;
          padding: 12px;
          background-color: #C10006;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }

        .login-btn:hover {
          background-color: #910106;
        }
      `}</style>

      <div className="screen-container">
        <div className="page-wrapper">
          <div className="logo-container">
            <img
              src="https://media.discordapp.net/attachments/970493021357506630/1531361277987913879/image.png?ex=6a68eed3&is=6a679d53&hm=891f772a6d9c0b99e7152d85510c4054d5a5c6d79d8578cc357eacb02d24e4ce&=&format=webp&quality=lossless"
              alt="Matapool Logo"
              className="logo-image"
            />
          </div>

          <div className="login-container">
            <h2>Log In</h2>
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

              <button type="submit" className="login-btn">
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;