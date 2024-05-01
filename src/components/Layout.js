import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../contexts/logoutcontext";
import { auth } from "../config/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import Navigationbar from "../pages/navbar";
import Loading from "react-fullscreen-loading";

/**
 * Layout wraps the main application layout.
 * It handles token management and session expiration.
 */
const Layout = () => {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [isLoading, setIsLoading] = useState(true);


  //Listens to the auth state and sets the current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setIsLoading(false);
      setCurrentUser(user);
    });

    return unsubscribe;
  }, []);


  //Navigation and location
  const navigate = useNavigate();
  const location = useLocation();


  //Logout function
  const logOut = async () => {
    try {
        console.log("Kijelentkezés")
        await signOut(auth);
        navigate("/");
    } catch (err) {
        console.error(err);
        // Consider providing feedback on logout errors
        //setError("Kijelentkezési hiba. Kérjük, próbálja újra.");
    }
  };
  

  //Render the layout
  return (
    <>
      {isLoading ? <Loading loading background="#ffffff" loaderColor="#3498db" /> :
      <AuthContext.Provider value={{ currentUser, logOut }}>
        {location.pathname === "/" ? <Outlet /> : <>
          <Navigationbar />
          <Outlet />
        </>}
      </AuthContext.Provider>
      }
    </>
  )
};

export default Layout;
