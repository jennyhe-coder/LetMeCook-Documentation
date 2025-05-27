import React, { useState } from 'react';
import '../styles.css';
import { Link } from 'react-router-dom';

const Contact = () => {
  const [formMessage, setFormMessage] = useState('');
  const [formClass, setFormClass] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = e.target.name.value.trim();
    const email = e.target.email.value.trim();
    const message = e.target.message.value.trim();

    if (!name || !email.includes('@') || !message) {
      setFormMessage("Please fill in all fields with valid information.");
      setFormClass("error");
      return;
    }

    // Placeholder for actual submission logic
    setFormMessage("Thank you! Your message has been sent successfully.");
    setFormClass("success");
    e.target.reset();
  };

  return (
    <>
      <header>
        <nav>
          <Link to="/about">About</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms & Conditions</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </header>

      <main>
        <section>
          <h2>Contact Us</h2>
          <p>
            We’d love to hear from you! Whether you have questions about recipes,
            feedback about the site, or ideas to share, please don’t hesitate to reach out.
          </p>

          <form onSubmit={handleSubmit} aria-label="Contact form">
            <label htmlFor="name">Your Name</label>
            <input type="text" id="name" name="name" placeholder="Your Name" required />

            <label htmlFor="email">Your Email</label>
            <input type="email" id="email" name="email" placeholder="Your Email" required />

            <label htmlFor="message">Your Message</label>
            <textarea id="message" name="message" rows="5" placeholder="Write your message here..." required></textarea>

            <button type="submit">Send</button>
            <p role="alert" aria-live="polite" className={formClass}>{formMessage}</p>
          </form>

          <h3>Privacy & Security</h3>
          <p>
            Any information you submit through this form is used solely to respond to your inquiry and improve our services.
            We do not share your contact details with third parties. Our site employs secure encryption protocols to protect
            your data during transmission and storage.
          </p>
        </section>
      </main>

      <footer>
        <div>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms & Conditions</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <p>&copy; 2025 Let Me Cook. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Contact;
