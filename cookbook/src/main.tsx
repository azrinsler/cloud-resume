import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/index.css'
import { App } from './App.tsx'
import { AuthProvider } from "react-oidc-context";
import {SignoutResponse, User, UserManager, WebStorageStateStore} from "oidc-client-ts";

const store = new WebStorageStateStore({ store: window.localStorage })
// this currently needs to be manually updated to match the user pool any time it gets recreated, which is not ideal
const manager = new UserManager({
    authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_O30KqnNDH",
    client_id: "4beki0cs423atvjm1kr2ojehhu",
    redirect_uri: "https://www.azrinsler.com/",
    response_type: "code",
    scope: "email openid profile",
    userStore: store,
    stateStore: store
});

// debug hooks
const onSignIn = (user: User | undefined) => {
    console.log('onSignIn() User:', user)
    window.history.replaceState({}, document.title, window.location.pathname)
}

const onSignOut = (resp: SignoutResponse | undefined) => {
    console.log(`onSignOut() SignoutResponse:`, resp)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <AuthProvider
          onSigninCallback = {onSignIn}
          onSignoutCallback={onSignOut}
          userManager={manager}
      >
          <App />
      </AuthProvider>
  </StrictMode>
)