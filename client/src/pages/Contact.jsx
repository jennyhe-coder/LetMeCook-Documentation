// src/pages/Contact.jsx
import React, { useState } from 'react';
import '../styles.css';    // global styles
import '../contact.css';    // page-specific styles
import { Link } from 'react-router-dom';

export default function Contact() {
  const [formMessage, setFormMessage] = useState('');
  const [formClass, setFormClass]   = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const name    = e.target.name.value.trim();
    const email   = e.target.email.value.trim();
    const message = e.target.message.value.trim();

    if (!name || !email.includes('@') || !message) {
      setFormMessage('Please fill in all fields with valid information.');
      setFormClass('error');
      return;
    }

    setFormMessage('Thank you! Your message has been sent successfully.');
    setFormClass('success');
    e.target.reset();
  };

  return (
    <>
      {/* Header / Navigation */}
      <header>
        <nav className="layout-wrapper main-nav">
          <div className="logo-section">
            <Link to="/">Let Me Cook</Link>
          </div>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/recipes">Recipes</Link>
            <Link to="/contact" className="active">Contact</Link>
            <Link to="/about">About</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>
        </nav>
      </header>

      {/* Contact Card */}
      <main>
        <section className="layout-wrapper contact-container">
          <h2>Contact Us</h2>
          <p className="intro">
            We’d love to hear from you! Whether you have questions about recipes, feedback about the site,
            or ideas to share, please don’t hesitate to reach out.
          </p>

          <form onSubmit={handleSubmit} className="contact-form" aria-label="Contact form">
            <div className="form-group">
              <label htmlFor="name">Your Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Your Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className="form-group form-group--full">
              <label htmlFor="message">Your Message *</label>
              <textarea
                id="message"
                name="message"
                className="form-input form-textarea"
                placeholder="Tell us what's on your mind..."
                required
              ></textarea>
            </div>

            <button type="submit" className="submit-btn">
              Send Message
            </button>

            {formMessage && (
              <div role="alert" aria-live="polite" className={`form-message ${formClass}`}>
                {formMessage}
              </div>
            )}
          </form>

          <h3>Privacy &amp; Security</h3>
          <p className="privacy-note">
            Any information you submit through this form is used solely to respond to your inquiry and improve our services.
            We do not share your contact details with third parties. Our site employs secure encryption protocols to protect
            your data during transmission and storage.
          </p>
        </section>
      </main>
    </>
  );
}
