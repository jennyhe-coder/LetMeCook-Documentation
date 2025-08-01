import React from "react";
import "../terms.css";
import "../styles.css";

const Terms = () => {
  return (
    <main>
      <section className="layout-wrapper terms-container">
        <h2>Terms &amp; Conditions</h2>
        <p>
          Welcome to Let Me Cook! By accessing or using our website, you agree to comply
          with and be bound by the following terms and conditions.
        </p>

        <h3>Use of the Website</h3>
        <p>
          You agree to use this site responsibly and ethically. You must not engage
          in any activity that disrupts, damages, or interferes with the website,
          its services, or other users. Unauthorized use may give rise to claims
          or be a criminal offense.
        </p>

        <h3>Intellectual Property</h3>
        <p>
          All content—text, images, recipes, logos, trademarks—is owned by Let Me Cook
          or its licensors. You may not reproduce, distribute, or create derivative works
          without explicit permission.
        </p>

        <h3>Content Accuracy</h3>
        <p>
          While we strive for accurate, up-to-date information, all content is provided
          “as is” without warranties. We’re not responsible for errors or omissions.
        </p>

        <h3>Third-Party Links</h3>
        <p>
          Our site may link to third-party websites. We do not endorse nor assume responsibility
          for any third-party content or privacy practices.
        </p>

        <h3>Limitation of Liability</h3>
        <p>
          Let Me Cook is not liable for any damages arising from the use or inability
          to use the site or services, including indirect or consequential damages.
        </p>

        <h3>Data Collection &amp; Privacy</h3>
        <p>
          By using our services, you consent to our collection and use of your data as outlined
          in our Privacy Policy.
        </p>

        <h3>Changes to Terms</h3>
        <p>
          We may modify these terms at any time. Continued use signifies acceptance of updates.
        </p>

        <h3>Governing Law</h3>
        <p>
          These terms are governed by the laws of the jurisdiction where Let Me Cook operates.
        </p>

        <div className="back-to-top">
          <a href="#">↑ Back to Top</a>
        </div>
      </section>
    </main>
  );
};

export default Terms;
