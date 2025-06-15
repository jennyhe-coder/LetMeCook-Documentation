// src/pages/About.jsx

import React from "react";
import "../styles.css";   // global site styles
import "../about.css";     // About‐page–specific styles

const About = () => {
  return (
    <>
      {/* Header / Navigation */}
      <header>
        <nav className="layout-wrapper main-nav">
          <a href="/">Home</a>
          <a href="/recipes">Recipes</a>
          <a href="/about" className="active">About Us</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms & Conditions</a>
          <a href="/contact">Contact</a>
        </nav>
      </header>

      {/* Main Content */}
      <main>
        <section className="layout-wrapper about-container">
          <h2>About Us</h2>
          <p>
            Welcome to <strong>Let Me Cook</strong>, your trusted kitchen companion and recipe resource.
            Founded by a passionate team of culinary enthusiasts, we are dedicated to making cooking
            accessible, enjoyable, and rewarding for everyone — from beginners to seasoned home chefs.
          </p>
          <p>
            Our mission is simple: to inspire confidence in the kitchen through clear, approachable
            recipes, innovative ideas, and helpful tips. Whether you want to prepare a quick weekday
            meal or impress guests with gourmet dishes, our curated recipes are designed to fit your
            lifestyle and taste.
          </p>

          <h3>Data and Technology</h3>
          <p>
            At Let Me Cook, we harness modern technology responsibly to enhance your experience.
            We collect minimal user data strictly for improving our services, personalizing content,
            and ensuring site functionality.
          </p>
          <p>
            Our recipe database is compiled from trusted culinary sources, licensed content, and
            original creations by our in-house chefs. Additionally, some of our recommendations
            are generated with the assistance of AI to provide personalized suggestions.
          </p>

          <h3>Ethical Commitment</h3>
          <p>
            We uphold a strong commitment to copyright and intellectual property rights.
            All content on this site is either owned by Let Me Cook, used under license,
            or sourced with permission.
          </p>
          <p>
            Thank you for being part of our community. We look forward to cooking alongside you
            and making every meal a memorable experience.
          </p>
        </section>

        <div className="section-line"></div>
      </main>

  
    </>
  );
};

export default About;
