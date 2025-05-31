import React, { useState } from "react";
import styles from "./HomeScreen.module.css";
import { GlobalHeader, GlobalFooter } from "../components/GlobalHeader&Footer";

// Section data
const sections = [
  {
    key: "meal-boxes",
    title: "Meal Boxes",
    description:
      "Curated meal boxes for individuals and families. Fresh, healthy, and delivered to your doorstep. Perfect for daily meals or special occasions.",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
    link: "/meal-boxes",
  },
  {
    key: "bulk-orders",
    title: "Bulk Orders",
    description:
      "Order in bulk for offices, hostels, or events. Hygienic, reliable, and customizable to your needs. Enjoy seamless delivery and great value.",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80",
    link: "/bulk-orders",
  },
  {
    key: "catering-services",
    title: "Catering Services",
    description:
      "Professional catering for weddings, parties, and corporate events. Choose from a wide range of cuisines and menu options.",
    image:
      "https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80",
    link: "/catering-services",
  },
  {
    key: "live-counters",
    title: "Live Counters",
    description:
      "Add excitement to your event with live food counters. Our chefs prepare dishes on-site, ensuring freshness and a memorable experience.",
    image:
      "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
    link: "/live-counters",
  },
];

function HomeSection({ section, expanded, onToggle }) {
  return (
    <div
      className={`${styles.sectionCard} ${
        expanded ? styles.expanded : ""
      }`}
    >
      <div className={styles.imageContainer}>
        <img
          src={section.image}
          alt={section.title}
          className={styles.sectionImage}
        />
        <button
          className={`${styles.chevronBtn} ${
            expanded ? styles.chevronOpen : ""
          }`}
          aria-label={expanded ? "Collapse section" : "Expand section"}
          onClick={onToggle}
        >
          <span className={styles.chevronIcon}>▼</span>
        </button>
        {!expanded && (
          <div className={styles.overlayFade}></div>
        )}
      </div>
      <div
        className={`${styles.sectionContent} ${
          expanded ? styles.contentExpanded : ""
        }`}
      >
        <h2 className={styles.sectionTitle}>{section.title}</h2>
        <p className={styles.sectionDesc}>{section.description}</p>
        <a
          href={section.link}
          className={styles.exploreLink}
          tabIndex={expanded ? 0 : -1}
        >
          Explore More &rarr;
        </a>
      </div>
    </div>
  );
}

export default function HomeScreen() {
  // For mobile: only one expanded at a time
  const [expandedIdx, setExpandedIdx] = useState(null);

  // Responsive: detect mobile
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < 700
  );
  React.useEffect(() => {
    const handleResize = () =>
      setIsMobile(window.innerWidth < 700);
    window.addEventListener("resize", handleResize);
    return () =>
      window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={styles.wrapper}>
      <GlobalHeader />
      <main className={styles.main}>
        <div className={styles.sectionsGrid}>
          {sections.map((section, idx) => (
            <HomeSection
              key={section.key}
              section={section}
              expanded={isMobile ? expandedIdx === idx : true}
              onToggle={() =>
                setExpandedIdx(expandedIdx === idx ? null : idx)
              }
            />
          ))}
        </div>
      </main>
      <GlobalFooter />
    </div>
  );
}