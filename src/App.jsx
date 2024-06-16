import Chat from "./components/Chat";
import Authentication from "./components/Authentication";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { useContext } from "react";
const App = () => {
  const user = useContext(AuthContext);

  // eslint-disable-next-line react/prop-types
  const SecureRoute = ({ children }) => {
    if (!user) {
      return <Navigate to={"/auth"} />;
    }
    return children;
  };
  // eslint-disable-next-line react/prop-types
  const SecureAuthRoute = ({ children }) => {
    if (user && user.photoURL) {
      return <Navigate to={"/"} />;
    }
    return children;
  };
  return (
    <>
      <main className="h-[100vh] bg-[#2D3250] flex items-center justify-center">
        <BrowserRouter>
          <Routes>
            <Route path="/">
              <Route
                index
                element={
                  <SecureRoute>
                    <Chat />
                  </SecureRoute>
                }
              ></Route>
              <Route
                path="/auth"
                element={
                  <SecureAuthRoute>
                    <Authentication />
                  </SecureAuthRoute>
                }
              ></Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </main>
    </>
  );
};

export default App;
