import './App.css';
import { Auth } from "./pages/auth/index";
import { Signup } from './pages/auth/register';
import { Map } from "./pages/map";
import { Places } from './pages/places';
import ForgotPassword from './pages/auth/forgotpassword';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from './components/Layout';
import Guide from './pages/guide/guide';


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
              }
            ],
          },
        ])} />
      </div>
  );
}

function App() {
  return (
          <Main />
  );
}

export default App;