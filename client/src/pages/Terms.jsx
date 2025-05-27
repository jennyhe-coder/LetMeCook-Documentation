import React from "react";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();

  const acceptTerms = () => {
    alert("Thank you for accepting the Terms & Conditions.");
    navigate("/about");
  };

  return (
    <>

      <main className="layout-wrapper">
        <section>
          <h2>Terms &amp; Conditions</h2>
          <p>
            Welcome to Let Me Cook! By accessing or using our website, you agree to comply with and be bound by the following terms and conditions.
          </p>

          <h3>Use of the Website</h3>
          <p>
            You agree to use this site responsibly and ethically. You must not engage in any activity that disrupts, damages, or interferes with the website, its services, or other users. Unauthorized use of the site may give rise to a claim for damages or be a criminal offense.
          </p>

          <h3>Intellectual Property</h3>
          <p>
            All content, including text, images, recipes, logos, and trademarks, is owned by Let Me Cook or its licensors. You may not reproduce, distribute, or create derivative works without explicit written permission.
          </p>

          <h3>Content Accuracy</h3>
          <p>
            While we strive to provide accurate and up-to-date information, all content is provided “as is” without warranties of any kind. We are not responsible for any errors or omissions, or for outcomes resulting from the use of our content.
          </p>

          <h3>Third-Party Links</h3>
          <p>
            Our site may contain links to third-party websites. We do not endorse or assume responsibility for any third-party content or privacy practices.
          </p>

          <h3>Limitation of Liability</h3>
          <p>
            Let Me Cook shall not be liable for any damages arising from the use or inability to use the site or services, including indirect, incidental, or consequential damages.
          </p>

          <h3>Data Collection &amp; Privacy</h3>
          <p>
            By using our services, you consent to our collection and use of your data as outlined in our Privacy Policy.
          </p>

          <h3>Changes to Terms</h3>
          <p>
            We reserve the right to modify these terms at any time. Continued use of the site signifies acceptance of any updated terms.
          </p>

          <h3>Governing Law</h3>
          <p>
            These terms shall be governed by and construed in accordance with the laws of the jurisdiction where Let Me Cook operates.
          </p>

          <button id="accept-terms" onClick={acceptTerms}>
            Accept Terms &amp; Conditions
          </button>
        </section>
      </main>
    </>
  );
};

export default Terms;