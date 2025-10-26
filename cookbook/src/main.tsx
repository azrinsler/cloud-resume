import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/index.css'
import { App } from './App.tsx'
import { AuthProvider } from "react-oidc-context";
import {WebStorageStateStore} from "oidc-client-ts";

// this currently needs to be manually updated to match the user pool any time it gets recreated, which is not ideal
const cognitoAuthConfig = {
    authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_O30KqnNDH",
    client_id: "4beki0cs423atvjm1kr2ojehhu",
    redirect_uri: "https://www.azrinsler.com/",
    response_type: "code",
    scope: "email openid profile",
    // allows user login session to persist across reloads, tabs, etc.
    automaticSilentRenew: true,
    monitorSession: true,
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    onSigninCallback: () => { console.log("onSigninCallback()") }
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <AuthProvider {...cognitoAuthConfig}>
          <App />
      </AuthProvider>
  </StrictMode>
)