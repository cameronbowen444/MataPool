import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaCarSide, FaBars, FaXmark } from "react-icons/fa6";

import { useAuth } from "../../context/AuthContext";
import styles from "./Navbar.module.css";
import redLogo from '../../assets/REDmatalogo.png';
import whiteLogo from '../../assets/WHITEmatalogo.png';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/login");
  };

  const getLinkClass = ({ isActive }) =>
    `${styles.link} ${isActive ? styles.active : ""}`;

  return (
    <header className={styles.header}>
      <nav className={styles.navbar} aria-label="Main navigation">
        <NavLink
          to={isAuthenticated ? "/dashboard" : "/register"}
          className={styles.logo}
          onClick={closeMenu}
        >
          <motion.img
            src={whiteLogo}
            alt="MataPool Logo"
            className={styles.logoIcon}
            style={{ 
              height: "28px", 
              width: "auto", 
              objectFit: "contain",
              padding: "2px" 
            }}
            whileHover={{ rotate: -7, scale: 1.06 }}
            transition={{ type: "spring", stiffness: 280 }}
          />

          <span className={styles.logoText}>MataPool</span>
        </NavLink>

        <div className={styles.desktopLinks}>
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={getLinkClass}>
                Dashboard
              </NavLink>

              <NavLink to="/events" className={getLinkClass}>
                Events
              </NavLink>

              <NavLink to="/carpools" className={getLinkClass}>
                Carpools
              </NavLink>

              <NavLink to="/profile" className={getLinkClass}>
                Profile
              </NavLink>

              <button
                type="button"
                className={styles.logoutButton}
                onClick={handleLogout}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={getLinkClass}>
                Log in
              </NavLink>

              <NavLink
                to="/register"
                className={styles.registerButton}
              >
                Register
              </NavLink>
            </>
          )}
        </div>

        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setIsOpen((previous) => !previous)}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
        >
          {isOpen ? (
            <FaXmark aria-hidden="true" />
          ) : (
            <FaBars aria-hidden="true" />
          )}
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-navigation"
            className={styles.mobileMenu}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <motion.div
              className={styles.mobileLinks}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.06,
                  },
                },
              }}
            >
              {isAuthenticated ? (
                <>
                  <MobileLink
                    to="/dashboard"
                    label="Dashboard"
                    onClick={closeMenu}
                  />
                  <MobileLink
                    to="/events"
                    label="Events"
                    onClick={closeMenu}
                  />
                  <MobileLink
                    to="/carpools"
                    label="Carpools"
                    onClick={closeMenu}
                  />
                  <MobileLink
                    to="/profile"
                    label="Profile"
                    onClick={closeMenu}
                  />

                  <motion.button
                    type="button"
                    className={styles.mobileLogoutButton}
                    onClick={handleLogout}
                    variants={mobileItemAnimation}
                  >
                    Log out
                  </motion.button>
                </>
              ) : (
                <>
                  <MobileLink
                    to="/login"
                    label="Log in"
                    onClick={closeMenu}
                  />

                  <motion.div variants={mobileItemAnimation}>
                    <NavLink
                      to="/register"
                      className={styles.mobileRegisterButton}
                      onClick={closeMenu}
                    >
                      Register
                    </NavLink>
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

const mobileItemAnimation = {
  hidden: {
    opacity: 0,
    y: -8,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

function MobileLink({ to, label, onClick }) {
  return (
    <motion.div variants={mobileItemAnimation}>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `${styles.mobileLink} ${
            isActive ? styles.mobileActive : ""
          }`
        }
        onClick={onClick}
      >
        {label}
      </NavLink>
    </motion.div>
  );
}

export default Navbar;