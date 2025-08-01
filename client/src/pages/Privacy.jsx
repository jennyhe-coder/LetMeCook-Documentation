import React from "react";
import "../styles.css";
import "../privacy.css";

const Privacy = () => (
  <main>
    <section className="layout-wrapper privacy-container">
      <h2>Privacy Policy</h2>
      <p>
        At Let Me Cook, your privacy and security are our top priorities...
      </p>

      <h3>Information We Collect</h3>
      <ul>
        <li><strong>Personal Information:</strong> ...</li>
        <li><strong>Usage Data:</strong> ...</li>
        <li><strong>Cookies:</strong> ...</li>
      </ul>

      <h3>How We Use Your Information</h3>
      <ul>
        <li>To respond to your inquiries...</li>
        <li>To send newsletters...</li>
        <li>To analyze website performance...</li>
        <li>To personalize your experience...</li>
      </ul>

      <h3>Data Storage and Security</h3>
      <p>
        We implement industry-standard security measures...
      </p>

      <h3>AI and Data Usage</h3>
      <p>
        Some features of our site may leverage artificial intelligence...
      </p>

      <h3>Recipe Database Sources</h3>
      <p>
        Our recipe database is compiled from...
      </p>

      <h3>Third-Party Services</h3>
      <p>
        We may use trusted third-party services...
      </p>

      <h3>Your Rights</h3>
      <ul>
        <li>Access the personal data we hold about you.</li>
        <li>Request correction or deletion of your data.</li>
        <li>Opt-out of marketing communications.</li>
        <li>Withdraw consent where applicable.</li>
      </ul>
      <p>To exercise any of these rights, please contact us through our Contact page.</p>

      <h3>Children’s Privacy</h3>
      <p>
        Let Me Cook does not knowingly collect personal information from children under 13...
      </p>

      <h3>Changes to This Policy</h3>
      <p>
        We may update this Privacy Policy occasionally...
      </p>

      <h3>Contact Us</h3>
      <p>
        If you have questions or concerns about your privacy, please reach out to us via our <a href="/contact">Contact page</a>.
      </p>

      <div className="back-to-top">
        <a href="#">↑ Back to Top</a>
      </div>
    </section>
  </main>
);

export default Privacy;
