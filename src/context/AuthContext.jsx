import { onAuthStateChanged } from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import ClockLoader from "react-spinners/ClockLoader";
export const AuthContext = createContext();

// eslint-disable-next-line react/prop-types
export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingTimer, setLoadingTimer] = useState(true);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        setLoadingTimer(false);
      }, 2000);
    }
  }, [loading]);
  if (loadingTimer) {
    return (
      <div className="h-[100vh] bg-[#2D3250] flex justify-center items-center">
        <ClockLoader color="#424769" />
      </div>
    ); // Or any loading spinner/component
  }

  return (
    <AuthContext.Provider value={currentUser}>{children}</AuthContext.Provider>
  );
};
