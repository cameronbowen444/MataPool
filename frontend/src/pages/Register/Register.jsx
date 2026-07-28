import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import redLogo from "../../assets/REDmatalogo.png";
import {
  FaCarSide,
  FaCheck,
  FaGoogle,
  FaUserPlus,
  FaUsers,
} from "react-icons/fa";

import styles from "./Register.module.css";

const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const initialFormData = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  password_confirm: "",
};

const pageAnimation = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.45,
      staggerChildren: 0.1,
    },
  },
};

const panelAnimation = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: "easeOut",
    },
  },
};

const itemAnimation = {
  hidden: {
    opacity: 0,
    y: 14,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
};

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
      general: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const normalizedEmail = formData.email.trim().toLowerCase();

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required.";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required.";
    }

    if (!normalizedEmail) {
      newErrors.email = "Email is required.";
    } else if (!normalizedEmail.endsWith("@my.csun.edu")) {
      newErrors.email =
        "You must register with a valid @my.csun.edu email.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password =
        "Password must contain at least 8 characters.";
    }

    if (!formData.password_confirm) {
      newErrors.password_confirm = "Please confirm your password.";
    } else if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = "Passwords do not match.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        const backendErrors = {};

        Object.entries(data).forEach(([field, value]) => {
          backendErrors[field] = Array.isArray(value)
            ? value.join(" ")
            : String(value);
        });

        setErrors({
          ...backendErrors,
          general:
            data.detail ||
            data.message ||
            "Registration failed. Please review your information.",
        });

        return;
      }

      setMessage(
        "Account created successfully. Redirecting to login..."
      );

      setFormData(initialFormData);

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      console.error("Registration error:", error);

      setErrors({
        general:
          "Could not connect to Django. Make sure the backend is running.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.main
      className={styles.page}
      variants={pageAnimation}
      initial="hidden"
      animate="visible"
    >
      <motion.section
        className={styles.registerShell}
        variants={panelAnimation}
      >
        <motion.aside
          className={styles.visualPanel}
          variants={panelAnimation}
        >
          <div className={styles.visualOverlay} />

          <motion.div
            className={styles.brand}
            variants={itemAnimation}
          >
            <motion.div
              className={styles.logoIcon}
              whileHover={{
                rotate: -8,
                scale: 1.08,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
              }}
            >
              <img src={redLogo} alt="MataPool Logo" style={{ height: "28px", width: "auto", objectFit: "contain" }} />
            </motion.div>

            <span>MataPool</span>
          </motion.div>

          <div className={styles.visualContent}>
            <motion.p
              className={styles.visualEyebrow}
              variants={itemAnimation}
            >
              Built for the CSUN community
            </motion.p>

            <motion.h2 variants={itemAnimation}>
              Connect. Discover. Carpool.
            </motion.h2>

            <motion.p variants={itemAnimation}>
              Meet verified students, discover campus events, share
              posts, and coordinate rides in one CSUN-focused
              platform.
            </motion.p>

            <div className={styles.steps}>
              <motion.div
                className={`${styles.step} ${styles.activeStep}`}
                variants={itemAnimation}
                whileHover={{
                  x: 5,
                }}
              >
                <span>
                  <FaUserPlus aria-hidden="true" />
                </span>

                <div>
                  <strong>Create your account</strong>
                  <small>Register with your CSUN email</small>
                </div>
              </motion.div>

              <motion.div
                className={styles.step}
                variants={itemAnimation}
                whileHover={{
                  x: 5,
                }}
              >
                <span>
                  <FaUsers aria-hidden="true" />
                </span>

                <div>
                  <strong>Build your profile</strong>
                  <small>Tell the community about yourself</small>
                </div>
              </motion.div>

              <motion.div
                className={styles.step}
                variants={itemAnimation}
                whileHover={{
                  x: 5,
                }}
              >
                <span>
                  <FaCheck aria-hidden="true" />
                </span>

                <div>
                  <strong>Join the community</strong>
                  <small>Explore events, posts, and carpools</small>
                </div>
              </motion.div>
            </div>
          </div>

          <motion.p
            className={styles.visualFooter}
            variants={itemAnimation}
          >
            California State University, Northridge
          </motion.p>
        </motion.aside>

        <motion.section
          className={styles.formPanel}
          aria-labelledby="register-title"
          variants={panelAnimation}
        >
          <div className={styles.formContainer}>
            <motion.header
              className={styles.header}
              variants={itemAnimation}
            >
              <p className={styles.eyebrow}>Welcome to MataPool</p>

              <h1 id="register-title">Create your account</h1>

              <p>
                Use your verified CSUN student email to get started.
              </p>
            </motion.header>

            <motion.button
              className={styles.googleButton}
              type="button"
              disabled
              aria-disabled="true"
              title="Google registration is coming soon"
              variants={itemAnimation}
            >
              <FaGoogle
                className={styles.googleIcon}
                aria-hidden="true"
              />

              <span>Continue with Google</span>

              <span className={styles.comingSoon}>
                Coming soon
              </span>
            </motion.button>

            <motion.div
              className={styles.divider}
              variants={itemAnimation}
            >
              <span>or register with email</span>
            </motion.div>

            {errors.general && (
              <motion.div
                className={styles.errorBanner}
                role="alert"
                initial={{
                  opacity: 0,
                  y: -8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
              >
                {errors.general}
              </motion.div>
            )}

            {message && (
              <motion.div
                className={styles.successBanner}
                role="status"
                initial={{
                  opacity: 0,
                  y: -8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
              >
                {message}
              </motion.div>
            )}

            <motion.form
              className={styles.form}
              onSubmit={handleSubmit}
              noValidate
              variants={pageAnimation}
            >
              <motion.div
                className={styles.nameRow}
                variants={itemAnimation}
              >
                <div className={styles.field}>
                  <label htmlFor="first_name">First name</label>

                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    placeholder="Cameron"
                    value={formData.first_name}
                    onChange={handleChange}
                    autoComplete="given-name"
                    aria-invalid={Boolean(errors.first_name)}
                    aria-describedby={
                      errors.first_name
                        ? "first-name-error"
                        : undefined
                    }
                  />

                  {errors.first_name && (
                    <p
                      id="first-name-error"
                      className={styles.fieldError}
                    >
                      {errors.first_name}
                    </p>
                  )}
                </div>

                <div className={styles.field}>
                  <label htmlFor="last_name">Last name</label>

                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    placeholder="Bowen"
                    value={formData.last_name}
                    onChange={handleChange}
                    autoComplete="family-name"
                    aria-invalid={Boolean(errors.last_name)}
                    aria-describedby={
                      errors.last_name
                        ? "last-name-error"
                        : undefined
                    }
                  />

                  {errors.last_name && (
                    <p
                      id="last-name-error"
                      className={styles.fieldError}
                    >
                      {errors.last_name}
                    </p>
                  )}
                </div>
              </motion.div>

              <motion.div
                className={styles.field}
                variants={itemAnimation}
              >
                <label htmlFor="email">CSUN email</label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="student@my.csun.edu"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? "email-error" : "email-help"
                  }
                />

                {errors.email ? (
                  <p
                    id="email-error"
                    className={styles.fieldError}
                  >
                    {errors.email}
                  </p>
                ) : (
                  <p
                    id="email-help"
                    className={styles.helpText}
                  >
                    Only @my.csun.edu accounts are accepted.
                  </p>
                )}
              </motion.div>

              <motion.div
                className={styles.field}
                variants={itemAnimation}
              >
                <label htmlFor="password">Password</label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password
                      ? "password-error"
                      : "password-help"
                  }
                />

                {errors.password ? (
                  <p
                    id="password-error"
                    className={styles.fieldError}
                  >
                    {errors.password}
                  </p>
                ) : (
                  <p
                    id="password-help"
                    className={styles.helpText}
                  >
                    Must contain at least 8 characters.
                  </p>
                )}
              </motion.div>

              <motion.div
                className={styles.field}
                variants={itemAnimation}
              >
                <label htmlFor="password_confirm">
                  Confirm password
                </label>

                <input
                  id="password_confirm"
                  name="password_confirm"
                  type="password"
                  placeholder="Enter your password again"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  autoComplete="new-password"
                  aria-invalid={Boolean(
                    errors.password_confirm
                  )}
                  aria-describedby={
                    errors.password_confirm
                      ? "password-confirm-error"
                      : undefined
                  }
                />

                {errors.password_confirm && (
                  <p
                    id="password-confirm-error"
                    className={styles.fieldError}
                  >
                    {errors.password_confirm}
                  </p>
                )}
              </motion.div>

              <motion.button
                className={styles.submitButton}
                type="submit"
                disabled={isSubmitting}
                variants={itemAnimation}
                whileHover={
                  isSubmitting
                    ? undefined
                    : {
                        y: -2,
                        scale: 1.01,
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
                {isSubmitting
                  ? "Creating account..."
                  : "Create account"}
              </motion.button>
            </motion.form>

            <motion.p
              className={styles.loginText}
              variants={itemAnimation}
            >
              Already have an account?{" "}
              <Link to="/login">Log in</Link>
            </motion.p>
          </div>
        </motion.section>
      </motion.section>
    </motion.main>
  );
}

export default Register;