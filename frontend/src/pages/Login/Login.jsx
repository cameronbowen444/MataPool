import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';

import { useAuth } from '../../context/AuthContext';
import whiteLogo from '../../assets/WHITEmatalogo.png';

import styles from './Login.module.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const getBackendError = (error) => {
    const data = error?.response?.data;

    if (!data) {
      return error?.message || 'Unable to log in. Please try again.';
    }

    if (typeof data === 'string') {
      return data;
    }

    if (data.detail) {
      return data.detail;
    }

    if (data.message) {
      return data.message;
    }

    if (data.error) {
      return data.error;
    }

    if (Array.isArray(data.non_field_errors)) {
      return data.non_field_errors[0];
    }

    if (Array.isArray(data.email)) {
      return data.email[0];
    }

    if (Array.isArray(data.password)) {
      return data.password[0];
    }

    const firstError = Object.values(data)[0];

    if (Array.isArray(firstError)) {
      return firstError[0];
    }

    if (typeof firstError === 'string') {
      return firstError;
    }

    return 'Unable to log in. Please check your information.';
  };

  const validateForm = () => {
    const newErrors = {};
    const normalizedEmail = formData.email.trim().toLowerCase();

    if (!normalizedEmail) {
      newErrors.email = 'Your CSUN email is required.';
    } else if (
      !normalizedEmail.endsWith('@my.csun.edu') &&
      !normalizedEmail.endsWith('@csun.edu')
    ) {
      newErrors.email =
        'Please use an official @my.csun.edu or @csun.edu email.';
    }

    if (!formData.password) {
      newErrors.password = 'Your password is required.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: '',
      general: '',
    }));
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setErrors({
        general: 'Google did not return a valid login credential.',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({});

      await login({
        googleToken: credentialResponse.credential,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Google login failed:', error);

      setErrors({
        general: getBackendError(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    setErrors({
      general:
        'Google login was unsuccessful. Please try again or use your CSUN email.',
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({});

      await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Standard login failed:', error);

      const backendData = error?.response?.data;
      const newErrors = {};

      if (Array.isArray(backendData?.email)) {
        newErrors.email = backendData.email[0];
      }

      if (Array.isArray(backendData?.password)) {
        newErrors.password = backendData.password[0];
      }

      if (!newErrors.email && !newErrors.password) {
        newErrors.general = getBackendError(error);
      }

      setErrors(newErrors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.screen}>
      <div className={styles.backgroundGlowOne} />
      <div className={styles.backgroundGlowTwo} />

      <motion.section
        className={styles.pageWrapper}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.45,
          ease: 'easeOut',
        }}
      >
        <motion.div
          className={styles.loginCard}
          initial={{ scale: 0.98 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.4,
            ease: 'easeOut',
          }}
        >
          <div className={styles.cardHeader}>
            <div className={styles.logoContainer}>
              <img
                src={whiteLogo}
                alt="MataPool"
                className={styles.logo}
              />
            </div>

            <p className={styles.eyebrow}>Welcome back</p>
            <h1 className={styles.title}>Log in to MataPool</h1>

            <p className={styles.subtitle}>
              Connect with the CSUN community using your student account.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {errors.general && (
              <motion.div
                key={errors.general}
                className={styles.generalError}
                role="alert"
                aria-live="polite"
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
              >
                <span className={styles.errorIcon}>!</span>

                <div>
                  <strong>Login unsuccessful</strong>
                  <p>{errors.general}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={styles.googleButtonWrapper}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              shape="rectangular"
              theme="outline"
              size="large"
              width="320"
              text="continue_with"
            />
          </div>

          <div className={styles.divider}>
            <span>or continue with email</span>
          </div>

          <form
            className={styles.form}
            onSubmit={handleSubmit}
            noValidate
          >
            <div className={styles.inputGroup}>
              <label
                className={styles.label}
                htmlFor="email"
              >
                CSUN email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="example.123@my.csun.edu"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? 'email-error' : undefined
                }
                className={`${styles.input} ${
                  errors.email ? styles.invalidInput : ''
                }`}
              />

              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    id="email-error"
                    className={styles.fieldError}
                    role="alert"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.labelRow}>
                <label
                  className={styles.label}
                  htmlFor="password"
                >
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className={styles.forgotPassword}
                >
                  Forgot password?
                </Link>
              </div>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? 'password-error' : undefined
                }
                className={`${styles.input} ${
                  errors.password ? styles.invalidInput : ''
                }`}
              />

              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    id="password-error"
                    className={styles.fieldError}
                    role="alert"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {errors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              type="submit"
              className={styles.loginButton}
              disabled={isSubmitting}
              whileHover={
                isSubmitting
                  ? undefined
                  : {
                      y: -2,
                    }
              }
              whileTap={
                isSubmitting
                  ? undefined
                  : {
                      scale: 0.98,
                    }
              }
            >
              {isSubmitting ? (
                <>
                  <span className={styles.spinner} />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>
        </motion.div>

        <p className={styles.registerText}>
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className={styles.registerLink}
          >
            Create an account
          </Link>
        </p>
      </motion.section>
    </main>
  );
}

export default Login;