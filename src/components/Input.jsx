import { IoDocumentAttachSharp } from "react-icons/io5";
import { FaImage } from "react-icons/fa";
import { BsSendFill } from "react-icons/bs";
import { AuthContext } from "../context/AuthContext";
import { useContext, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import {
  Timestamp,
  arrayUnion,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../firebase";
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
const Input = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const userContext = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const handleSend = async () => {
    setIsSending(true);
    setText("");
    try {
      if (img) {
        const storageRef = ref(storage, uuid());
        const uploadTask = uploadBytesResumable(storageRef, img);

        uploadTask.on(
          "state_changed",
          null,
          (error) => {
            // Handle error
            console.error(error);
          },
          async () => {
            // Handle successful upload
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Update messages in chats collection
            await updateDoc(doc(db, "chats", data.chatId), {
              messages: arrayUnion({
                id: uuid(),
                text,
                senderId: userContext.uid,
                date: Timestamp.now(),
                img: downloadURL,
              }),
            });

            // Update last message in userChats for both users

            // Reset input fields
          }
        );
      } else {
        // Update messages in chats collection
        await updateDoc(doc(db, "chats", data.chatId), {
          messages: arrayUnion({
            id: uuid(),
            text,
            senderId: userContext.uid,
            date: Timestamp.now(),
          }),
        });

        // Update last message in userChats for both users

        // Reset input fields
      }

      await updateDoc(doc(db, "userChats", userContext.uid), {
        [data.chatId + ".lastMessage"]: {
          text,
        },
        [data.chatId + ".date"]: serverTimestamp(),
      });
      await updateDoc(doc(db, "userChats", data.user.uid), {
        [data.chatId + ".lastMessage"]: {
          text,
        },
        [data.chatId + ".date"]: serverTimestamp(),
      });
      setImg(null);
      setImageFile(null);
      setIsSending(false);
    } catch (error) {
      setIsSending(false);
      console.error("Error sending message:", error);
    }
  };

  const handleImageChange = (e) => {
    setImg(e.target.files[0]);
    if (e.target.files && e.target.files[0]) {
      setImageFile(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="flex border-t border-t-[#7077A1]">
      <input
        type="text"
        className="flex-1 input-text-send h-[50px] bg-transparent outline-none border-0 text-[#7077A1] text-[18px] px-5 placeholder:text-[#7077A1]"
        placeholder={isSending ? "Sending..." : "Type Your Message"}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex gap-5 h-[50px] px-5 justify-between items-center border-l border-l-[#7077A1]">
        <button className="text-[25px] file-send-icon text-[#7077A1]">
          <IoDocumentAttachSharp />
        </button>
        <label className="text-[25px] text-[#7077A1] cursor-pointer">
          <FaImage />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>
        {img && (
          <div className="flex items-center justify-center w-full h-full overflow-hidden">
            <img
              src={imageFile}
              alt="Preview"
              className="max-w-full max-h-[50px] object-cover"
            />
          </div>
        )}
        <button className="text-[25px] text-[#7077A1]" onClick={handleSend}>
          <BsSendFill />
        </button>
      </div>
    </div>
  );
};

export default Input;
// npx tailwindcss -i ./src/index.css -o ./src/tailwind_output.css --watch
