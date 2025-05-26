import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SplashScreen.module.css';

function SplashScreen() {
  const [fade, setFade] = useState('fade-in');
  const navigate = useNavigate();

  useEffect(() => {
    // Fade in, then fade out, then navigate
    const fadeInTimeout = setTimeout(() => setFade('fade-out'), 1500); // Show for 1.5s
    const navigateTimeout = setTimeout(() => navigate('/welcome'), 2500); // Total 2.5s

    return () => {
      clearTimeout(fadeInTimeout);
      clearTimeout(navigateTimeout);
    };
  }, [navigate]);

  return (
    <div className={styles.splashContainer}>
      <h1 className={styles[fade]}>FUDORO</h1>
    </div>
  );
}

export default SplashScreen;