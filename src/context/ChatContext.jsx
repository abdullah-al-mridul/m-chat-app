import { createContext, useContext, useReducer } from "react";
import { AuthContext } from "./AuthContext";
export const ChatContext = createContext();
// eslint-disable-next-line react/prop-types
export const ChatContextProvider = ({ children }) => {
  const initialState = {
    chatId: 'null',
    user: {},
  };
  const userContext = useContext(AuthContext);
  const chatReducer = (state, action) => {
    switch (action.type) {
      case "changeUser":
        return {
          user: action.payload,
          chatId:
            userContext.uid > action.payload.uid
              ? userContext.uid + action.payload.uid
              : action.payload.uid + userContext.uid,
        };
      default:
        return state;
    }
  };
  const [state, dispatch] = useReducer(chatReducer, initialState);
  return (
    <ChatContext.Provider value={{ data: state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};
