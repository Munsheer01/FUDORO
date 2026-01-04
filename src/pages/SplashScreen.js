// SplashScreen.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SplashScreen.module.css';

export default function SplashScreen() {
  const [fade, setFade] = useState('fade-in');
  const navigate = useNavigate();
  useEffect(() => {
    const fadeInTimeout = setTimeout(() => setFade('fade-out'), 1500);
    const navigateTimeout = setTimeout(() => navigate('/welcome'), 2500);
    return () => {
      clearTimeout(fadeInTimeout);
      clearTimeout(navigateTimeout);
    };
  }, [navigate]);
  return (
    <div className={styles.splashContainer}>
      <h1 className={styles[fade]} aria-label="Fudoro food delivery">FUDORO</h1>
    </div>
  );
}
