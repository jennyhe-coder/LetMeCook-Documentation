import React from 'react';
import errImage from '../assets/401error.png';

const Err401 = () => {
  return (
    <div className="error-page">
      <h1>Error 401: Unauthorized</h1>
      <p>You do not have permission to view this page. Please log in to access this content.</p>
      <img src={errImage} alt="Error 401" />
    </div>
  );
};

export default Err401;
