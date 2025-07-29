import React from "react";
import errImage from "../assets/403error.png";

const Err403 = () => {
  return (
    <div className="error-page">
      <h1>Error 403: Forbidden</h1>
      <p>You do not have permission to view this page. Please contact support if you believe this is an error.</p>
      <img src={errImage} alt="Error 403" />
    </div>
  );
};

export default Err403;
