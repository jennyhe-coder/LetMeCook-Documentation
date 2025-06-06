import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";

import "./styles.css";
import App from "./App.jsx";

const domain = "dev-k6juacqfcvxnltbr.us.auth0.com";
const clientId = "Em74YDN8OzYHWk8Oxc4PGenze73LaSW1";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://letmecook/api",
        scope: "openid profile email"
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
      onRedirectCallback={(appState) => {
        window.history.replaceState(
          {},
          document.title,
          appState?.returnTo || "/"
        );
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Auth0Provider>
  </StrictMode>
);
