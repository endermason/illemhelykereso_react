import './App.css';
import { React, useEffect } from 'react';
import { Auth } from "./pages/auth/index";
import { Signup } from './pages/auth/register';
import { Map } from "./pages/map";
import { Places } from './pages/places';
import ForgotPassword from './pages/auth/forgotpassword';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from './components/Layout';
import Guide from './pages/guide/guide';
import { useTranslation } from 'react-i18next';
import NoPage from "./components/nopage";
import MailChecker from './components/mail';


function Main() {
  return (
    <div className="App">
      <RouterProvider router={createBrowserRouter([
        {
          path: "/",
          element: <Layout />,
          children: [
            {
              index: true,
              Component: Map,
            },
            {
              path: "login",
              Component: Auth,
            },
            {
              path: "register",
              Component: Signup,
            },
            {
              path: "places",
              Component: Places,
            },
            {
              path: "forgotpassword",
              Component: ForgotPassword,
            },
            {
              path: "guide",
              Component: Guide,
            },
            {
              path: "mail",
              Component: MailChecker,
            },
            {
              path: "*",
              Component: NoPage,
            }
          ],
        },
      ])} />
    </div>
  );
}

function App() {
  const { t, i18n } = useTranslation();
  return (
    <Main />
  );
}

export default App;