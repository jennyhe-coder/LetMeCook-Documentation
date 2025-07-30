import React from 'react';
import errImage from '../assets/404.png';

const Err401 = () => {
  return (
    <div className="error-page">
      <h1>Error 404: Not Found</h1>
      <p>The page you are looking for does not exist. Please check the URL or return to the homepage.</p>
      <img src={errImage} alt="Error 404" />
    </div>
  );
};

export default Err401;
