import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import whiteLogo from '../../assets/WHITEmatalogo.png';
import styles from './Register.module.css';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const initialFormData = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirm: '',
};

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setSuccessMessage('');
  };

  const validateForm = () => {
    const newErrors = {};
    const normalizedEmail = formData.email.trim().toLowerCase();

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Your first name is required.';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Your last name is required.';
    }

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
      newErrors.password = 'A password is required.';
    } else if (formData.password.length < 8) {
      newErrors.password =
        'Your password must contain at least 8 characters.';
    }

    if (!formData.password_confirm) {
      newErrors.password_confirm =
        'Please enter your password again.';
    } else if (
      formData.password !== formData.password_confirm
    ) {
      newErrors.password_confirm = 'The passwords do not match.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const normalizeBackendErrors = (data) => {
    const backendErrors = {};

    if (!data || typeof data !== 'object') {
      return {
        general:
          'Registration failed. Please review your information.',
      };
    }

    Object.entries(data).forEach(([field, value]) => {
      const message = Array.isArray(value)
        ? value.join(' ')
        : typeof value === 'string'
          ? value
          : '';

      if (!message) {
        return;
      }

      if (
        field === 'detail' ||
        field === 'message' ||
        field === 'error' ||
        field === 'non_field_errors'
      ) {
        backendErrors.general = message;
      } else {
        backendErrors[field] = message;
      }
    });

    if (!backendErrors.general) {
      const hasFieldErrors = Object.keys(backendErrors).length > 0;

      if (!hasFieldErrors) {
        backendErrors.general =
          'Registration failed. Please review your information.';
      }
    }

    return backendErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({});

      const response = await fetch(`${API_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          email: formData.email.trim().toLowerCase(),
          username: formData.email.trim().toLowerCase(),
          password: formData.password,
          password_confirm: formData.password_confirm,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrors(normalizeBackendErrors(data));
        return;
      }

      setFormData(initialFormData);
      setSuccessMessage(
        'Your account was created successfully. Redirecting to login...',
      );

      window.setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (error) {
      console.error('Registration error:', error);

      setErrors({
        general:
          'Unable to connect to MataPool. Make sure the backend server is running.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFieldError = (fieldName, errorId) => (
    <AnimatePresence>
      {errors[fieldName] && (
        <motion.p
          id={errorId}
          className={styles.fieldError}
          role="alert"
          initial={{
            opacity: 0,
            y: -4,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: -4,
          }}
        >
          {errors[fieldName]}
        </motion.p>
      )}
    </AnimatePresence>
  );

  return (
    <main className={styles.screen}>
      <div className={styles.backgroundGlowOne} />
      <div className={styles.backgroundGlowTwo} />

      <motion.section
        className={styles.pageWrapper}
        initial={{
          opacity: 0,
          y: 24,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.45,
          ease: 'easeOut',
        }}
      >
        <motion.div
          className={styles.registerCard}
          initial={{
            scale: 0.98,
          }}
          animate={{
            scale: 1,
          }}
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

            <p className={styles.eyebrow}>Join the community</p>

            <h1 className={styles.title}>
              Create your MataPool account
            </h1>

            <p className={styles.subtitle}>
              Register with your CSUN email to connect with
              students, events, posts, and carpools.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {errors.general && (
              <motion.div
                key={errors.general}
                className={styles.generalError}
                role="alert"
                aria-live="polite"
                initial={{
                  opacity: 0,
                  y: -8,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  height: 'auto',
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                  height: 0,
                }}
              >
                <span className={styles.errorIcon}>!</span>

                <div>
                  <strong>Registration unsuccessful</strong>
                  <p>{errors.general}</p>
                </div>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                key={successMessage}
                className={styles.successMessage}
                role="status"
                aria-live="polite"
                initial={{
                  opacity: 0,
                  y: -8,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  height: 'auto',
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                  height: 0,
                }}
              >
                <span className={styles.successIcon}>✓</span>

                <div>
                  <strong>Account created</strong>
                  <p>{successMessage}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form
            className={styles.form}
            onSubmit={handleSubmit}
            noValidate
          >
            <div className={styles.nameRow}>
              <div className={styles.inputGroup}>
                <label
                  className={styles.label}
                  htmlFor="first_name"
                >
                  First name
                </label>

                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Cameron"
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.first_name)}
                  aria-describedby={
                    errors.first_name
                      ? 'first-name-error'
                      : undefined
                  }
                  className={`${styles.input} ${
                    errors.first_name
                      ? styles.invalidInput
                      : ''
                  }`}
                />

                {renderFieldError(
                  'first_name',
                  'first-name-error',
                )}
              </div>

              <div className={styles.inputGroup}>
                <label
                  className={styles.label}
                  htmlFor="last_name"
                >
                  Last name
                </label>

                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Bowen"
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.last_name)}
                  aria-describedby={
                    errors.last_name
                      ? 'last-name-error'
                      : undefined
                  }
                  className={`${styles.input} ${
                    errors.last_name ? styles.invalidInput : ''
                  }`}
                />

                {renderFieldError(
                  'last_name',
                  'last-name-error',
                )}
              </div>
            </div>

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
                  errors.email ? 'email-error' : 'email-help'
                }
                className={`${styles.input} ${
                  errors.email ? styles.invalidInput : ''
                }`}
              />

              {errors.email ? (
                renderFieldError('email', 'email-error')
              ) : (
                <p
                  id="email-help"
                  className={styles.helpText}
                >
                  Use your @my.csun.edu or @csun.edu account.
                </p>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label
                className={styles.label}
                htmlFor="password"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password
                    ? 'password-error'
                    : 'password-help'
                }
                className={`${styles.input} ${
                  errors.password ? styles.invalidInput : ''
                }`}
              />

              {errors.password ? (
                renderFieldError('password', 'password-error')
              ) : (
                <p
                  id="password-help"
                  className={styles.helpText}
                >
                  Your password must be at least 8 characters.
                </p>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label
                className={styles.label}
                htmlFor="password_confirm"
              >
                Confirm password
              </label>

              <input
                id="password_confirm"
                name="password_confirm"
                type="password"
                autoComplete="new-password"
                placeholder="Enter your password again"
                value={formData.password_confirm}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(
                  errors.password_confirm,
                )}
                aria-describedby={
                  errors.password_confirm
                    ? 'password-confirm-error'
                    : undefined
                }
                className={`${styles.input} ${
                  errors.password_confirm
                    ? styles.invalidInput
                    : ''
                }`}
              />

              {renderFieldError(
                'password_confirm',
                'password-confirm-error',
              )}
            </div>

            <motion.button
              type="submit"
              className={styles.registerButton}
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
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </motion.button>
          </form>
        </motion.div>

        <p className={styles.loginText}>
          Already have an account?{' '}
          <Link
            to="/login"
            className={styles.loginLink}
          >
            Log in
          </Link>
        </p>
      </motion.section>
    </main>
  );
}

export default Register;