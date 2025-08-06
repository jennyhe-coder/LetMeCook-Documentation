// src/pages/Contact.jsx

import React, { useState } from 'react';
import '../styles.css';    // global styles
import '../contact.css';  // page-specific styles

export default function Contact() {
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const [formMessage, setFormMessage] = useState('');
  const [formClass, setFormClass] = useState('');

  function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = e.target.name.value.trim();
    const email = e.target.email.value.trim();
    const message = e.target.message.value.trim();

    if (!name || !email.includes('@') || !message) {
      setFormMessage('Please fill in all fields with valid information.');
      setFormClass('error');
      return;
    }

    if (!isValidEmail(email)) {
      setFormMessage('Please enter a valid email address format.');
      setFormClass('error');
      return;
    }

    // send email logic using edge function 
    try {
      const res = await fetch('https://cbyiuthgfdbnhrxoaelw.supabase.co/functions/v1/send-contact-email', 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${anonKey}`
          },
          body: JSON.stringify({ name, email, message })
        }
      );

      if (!res.ok) {
        throw new Error('Failed to send message');
      }

      setFormMessage('Thank you! Your message has been sent successfully.');
      setFormClass('success');
      e.target.reset();
    } catch (err) {
      console.error(err);
      setFormMessage('Opps! Something went wrong. Please try again later.');
      setFormClass('error');
    }
  };

  return (
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
            <div
              role="alert"
              aria-live="polite"
              className={`form-message ${formClass}`}
            >
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
        <div className="back-to-top">
  <a href="#">↑ Back to Top</a>
</div>

      </section>
    </main>
  );
}
