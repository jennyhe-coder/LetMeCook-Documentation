import React from "react";
import "../styles.css";
import "../privacy.css";

const Privacy = () => (
  <main>
    <section className="layout-wrapper privacy-container">
      <h2>Privacy Policy</h2>
      <p>
        At <strong>Let Me Cook</strong>, your privacy and security are incredibly important to us. This Privacy Policy explains what information we collect, how we use it, and the steps we take to protect it.
      </p>

      <h3>Information We Collect</h3>
      <ul>
        <li>
          <strong>Personal Information:</strong> We collect your name, email address, profile information, cooking preferences, and dietary restrictions when you create an account or fill out forms on our site.
        </li>
        <li>
          <strong>Usage Data:</strong> This includes data such as pages you visit, the time you spend on them, the recipes you interact with, and how you use features like search and filters.
        </li>
        <li>
          <strong>Cookies:</strong> We use cookies to store your preferences, keep you signed in, and provide insights into how users engage with the site.
        </li>
      </ul>

      <h3>How We Use Your Information</h3>
      <ul>
        <li>To respond to your questions and feedback submitted through the contact form.</li>
        <li>To send optional newsletters and site updates if you subscribe.</li>
        <li>To monitor, fix, and improve our website's performance and usability.</li>
        <li>To tailor recipe recommendations and content based on your preferences.</li>
      </ul>

      <h3>Data Storage and Security</h3>
      <p>
        We store your information using secure, encrypted systems and limit access to authorized personnel only. Our platform partners follow industry-standard practices for security and data protection.
      </p>

      <h3>AI and Data Usage</h3>
      <p>
        Some features—such as recipe suggestions or ingredient matching—use artificial intelligence to enhance your experience. These systems only analyze information relevant to your activity on the site and do not access sensitive personal data.
      </p>

      <h3>Recipe Database Sources</h3>
      <p>
        Our recipe collection is built from original user submissions, licensed contributors, and curated recipes from trusted public and culinary sources. Each recipe goes through a review process for quality and accuracy.
      </p>

      <h3>Third-Party Services</h3>
      <p>
        We use trusted external services to support functions like email delivery, analytics, and file hosting (e.g., Supabase, Google Analytics). These services follow strict privacy standards and are essential to site functionality.
      </p>

      <h3>Your Rights</h3>
      <ul>
        <li>You may request access to the personal data we store about you.</li>
        <li>You can ask us to update or delete your information.</li>
        <li>You can opt out of receiving emails or marketing at any time.</li>
        <li>You may withdraw consent for data processing when applicable.</li>
      </ul>
      <p>
        To make any of these requests, please contact us using the form on our <a href="/contact">Contact page</a>.
      </p>

      <h3>Children’s Privacy</h3>
      <p>
        Let Me Cook is not intended for children under 13. We do not knowingly collect data from children. If we learn that a child has submitted personal information, we will delete it immediately.
      </p>

      <h3>Changes to This Policy</h3>
      <p>
        We may update this Privacy Policy periodically to reflect changes in law, technology, or services. Updates will be posted on this page with a revised effective date.
      </p>

      <h3>Contact Us</h3>
      <p>
        Have questions or concerns about your privacy? Please don’t hesitate to reach out through our <a href="/contact">Contact page</a>.
      </p>

      <div className="back-to-top">
        <a href="#">↑ Back to Top</a>
      </div>
    </section>
  </main>
);

export default Privacy;
