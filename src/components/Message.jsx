import { useContext } from "react";
import Avater from "./Avater";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

const Message = ({ message, direction }) => {
  const userContext = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const isSender = message.senderId === userContext.uid;

  return (
    <div>
      <div
        className={`flex gap-message-ava mb-4 gap-x-4 ${
          isSender ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div className="min-w-[50px]">
          <div className={isSender ? "sender-style" : ""}>
            <Avater
              src={isSender ? userContext.photoURL : data.user.photoURL}
            />
          </div>
          <p className="text-xs just-now-text text-[#7077A1] mt-1">Just Now</p>
        </div>
        <div className="max-w-[70%]">
          {message.text && (
            <p
              className={`shadow-sm text-sm p-4 rounded-lg ${
                isSender
                  ? "bg-[#7077A1] text-[#2D3250] rounded-tr-none"
                  : "bg-[#7077A1] text-[#2D3250] rounded-tl-none"
              }`}
            >
              {message.text}
            </p>
          )}
          {message.img && (
            <div className={`w-[100%] mt-2 bg-[#7077A1] p-3 rounded-lg`}>
              <img src={message.img} alt="photo" className="w-full rounded" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
