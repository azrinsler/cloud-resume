import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/index.css'
import { App } from './App.tsx'
import { AuthProvider } from "react-oidc-context";

const cognitoAuthConfig = {
    authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_N7x4hlGeQ",
    client_id: "2posfe5jgoesk9e8sc7b5s8os8",
    redirect_uri: "https://www.azrinsler.com/",
    response_type: "code",
    scope: "email openid profile",
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <AuthProvider {...cognitoAuthConfig}>
          <App />
      </AuthProvider>
  </StrictMode>,
)