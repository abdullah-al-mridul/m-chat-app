import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./tailwind_output.css";
import { PrimeReactProvider } from "primereact/api";
import "./style.css";
import { AuthContextProvider } from "./context/AuthContext.jsx";
import { ChatContextProvider } from "./context/ChatContext.jsx";
const OffLineRedireact = () => {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  return <>{online ? <App /> : <Offline />}</>;
};
const Offline = () => {
  return (
    <div className="offline-screen">
      <p>Your Device Offline!</p>
    </div>
  );
};
ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthContextProvider>
    <ChatContextProvider>
      <React.StrictMode>
        <PrimeReactProvider>
          <OffLineRedireact />
        </PrimeReactProvider>
      </React.StrictMode>
    </ChatContextProvider>
  </AuthContextProvider>
);
