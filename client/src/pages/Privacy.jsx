import React from "react";
import "../styles.css";      // global reset + layout
import "../privacy.css";     // page-specific styles

const Privacy = () => (
  <>
    {/* Header / Navigation */}
    <header>
      <nav className="layout-wrapper main-nav">
        <a href="/">Home</a>
        <a href="/recipes">Recipes</a>
        <a href="/about">About Us</a>
        <a href="/privacy" className="active">Privacy Policy</a>
        <a href="/terms">Terms & Conditions</a>
        <a href="/contact">Contact</a>
      </nav>
    </header>

    {/* Main Content */}
    <main>
      <section className="layout-wrapper privacy-container">
        <h2>Privacy Policy</h2>
        <p>
          At Let Me Cook, your privacy and security are our top priorities. This policy explains what information we collect,
          how we use it, and your rights regarding your data.
        </p>

        <h3>Information We Collect</h3>
        <ul>
          <li><strong>Personal Information:</strong> When you contact us or sign up for newsletters, we collect your name, email address,
              and any other information you voluntarily provide.</li>
          <li><strong>Usage Data:</strong> We automatically collect information about how you use our website, such as IP addresses,
              browser types, pages visited, and time spent on the site. This helps us improve our service.</li>
          <li><strong>Cookies:</strong> Our site uses cookies to enhance user experience by remembering preferences and tracking usage patterns.
              You can disable cookies in your browser settings if you prefer.</li>
        </ul>

        <h3>How We Use Your Information</h3>
        <ul>
          <li>To respond to your inquiries and provide customer support.</li>
          <li>To send newsletters and updates if you opt in.</li>
          <li>To analyze website performance and improve our content.</li>
          <li>To personalize your experience on our site.</li>
        </ul>

        <h3>Data Storage and Security</h3>
        <p>
          We implement industry-standard security measures to protect your data against unauthorized access, alteration, disclosure, or destruction.
          Data is stored securely using encrypted databases and access controls. However, no method of transmission over the Internet is completely secure,
          so we cannot guarantee absolute security.
        </p>

        <h3>AI and Data Usage</h3>
        <p>
          Some features of our site may leverage artificial intelligence to enhance your experience, such as recipe recommendations.
          Any data fed into AI systems is anonymized and aggregated to protect your identity. We never share your personal information with
          third-party AI providers without your consent.
        </p>

        <h3>Recipe Database Sources</h3>
        <p>
          Our recipe database is compiled from a combination of original content created by our team, licensed recipe collections,
          and user-submitted recipes. We ensure all sources are properly credited, and user-submitted recipes are reviewed for quality and compliance.
        </p>

        <h3>Third-Party Services</h3>
        <p>
          We may use trusted third-party services for analytics, email marketing, and hosting. These services are contractually obligated to keep
          your data confidential and use it only to provide their services to us.
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
          Let Me Cook does not knowingly collect personal information from children under 13. If you believe we have inadvertently collected
          such data, please contact us immediately to have it removed.
        </p>

        <h3>Changes to This Policy</h3>
        <p>
          We may update this Privacy Policy occasionally. Any changes will be posted on this page with an updated effective date. Continued use
          of our website after changes signifies acceptance of the new terms.
        </p>

        <h3>Contact Us</h3>
        <p>
          If you have questions or concerns about your privacy, please reach out to us via our <a href="/contact">Contact page</a>.
        </p>
      </section>
    </main>

  
  </>
);

export default Privacy;