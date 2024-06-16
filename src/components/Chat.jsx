import { IoCall, IoMenu } from "react-icons/io5";
import { MdVideoCall } from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";
import Input from "./Input";
import Avater from "./Avater";
import Message from "./Message";
import { Sidebar } from "primereact/sidebar";
import { useState, useContext, useEffect, useRef } from "react";
import { SignOut } from "phosphor-react";
import { Modal } from "keep-react";
import { auth, db } from "../firebase";
import { AuthContext } from "../context/AuthContext";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { Button } from "primereact/button";
import { KeepButton } from "./ButtonHOC";
import { ChatContext } from "../context/ChatContext";

const Chat = () => {
  const [searching, setSearching] = useState(false);
  const [sideBarVisible, setSideBarVisible] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const userContext = useContext(AuthContext);
  const [notFound, setNotFound] = useState(null);
  const [userLoadingText, setUserLoadingText] = useState(null);
  const [chats, setChats] = useState({});
  const { dispatch } = useContext(ChatContext);
  const { data } = useContext(ChatContext);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
      if (doc.exists()) {
        setMessages(doc.data().messages);
        scrollToBottom();
      }
    });
    return () => {
      unSub();
    };
  }, [data.chatId]);
  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(doc(db, "userChats", userContext.uid), (doc) => {
        doc.data() ? setChats(doc.data()) : console.log("no data found");
      });
      return () => {
        unsub();
      };
    };
    userContext.uid && getChats();
  }, [userContext.uid]);
  const customHeader = (
    <div className="flex align-items-center gap-2 items-center">
      <Avater src={userContext.photoURL} />
      <span className="font-bold username">{userContext.displayName}</span>
    </div>
  );
  const handleSearch = async () => {
    setSearching(true);
    const q = query(
      collection(db, "users"),
      where("username", "==", searchText)
    );

    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        // Handle case where no documents match the query
        setNotFound(true);
        setSearchResult(null);
        setSearching(false);
        setTimeout(() => {
          setNotFound(false);
        }, 4000);
      } else {
        // Process the first document found (assuming usernames are unique)
        querySnapshot.forEach((doc) => {
          setSearchResult(doc.data());
        });
        setNotFound(false); // Reset not found state if a result is found
        setSearching(false);
      }
    } catch (err) {
      console.error("Error searching for user:", err);
      setNotFound(true);
      setSearchResult(null);
      setSearching(false);

      // Clear search text after search
      setSearchText("");
    }
  };
  const userSelect = async () => {
    setUserLoadingText("Loading...");
    const combinedId =
      userContext.uid > searchResult.uid
        ? userContext.uid + searchResult.uid
        : searchResult.uid + userContext.uid;

    try {
      const chatDocRef = doc(db, "chats", combinedId);
      const userChatsRef = doc(db, "userChats", userContext.uid);
      const searchResultChatsRef = doc(db, "userChats", searchResult.uid);

      // Check if the chat already exists
      const chatDoc = await getDoc(chatDocRef);
      if (!chatDoc.exists()) {
        await setDoc(chatDocRef, { messages: [] });
      }

      // Check if userChats documents exist, and create if not
      const userChatsDoc = await getDoc(userChatsRef);
      if (!userChatsDoc.exists()) {
        await setDoc(userChatsRef, {});
      }

      const searchResultChatsDoc = await getDoc(searchResultChatsRef);
      if (!searchResultChatsDoc.exists()) {
        await setDoc(searchResultChatsRef, {});
      }

      // Update userChats documents
      const userChatUpdate = {
        [`${combinedId}.userInfo`]: {
          uid: searchResult.uid,
          displayName: searchResult.username,
          photoURL: searchResult.photoURL,
        },
        [`${combinedId}.date`]: serverTimestamp(),
      };

      const searchResultChatUpdate = {
        [`${combinedId}.userInfo`]: {
          uid: userContext.uid,
          displayName: userContext.displayName,
          photoURL: userContext.photoURL,
        },
        [`${combinedId}.date`]: serverTimestamp(),
      };

      await Promise.all([
        updateDoc(userChatsRef, userChatUpdate),
        updateDoc(searchResultChatsRef, searchResultChatUpdate),
      ]);
    } catch (err) {
      console.log(err);
    }
    setSearchResult(null);
    setSideBarVisible(false);
    setUserLoadingText(null);
    setSearchText("");
  };
  const handleSelect = (u) => {
    dispatch({ type: "changeUser", payload: u });
    setSideBarVisible(false);
  };

  return (
    <section className="h-[80%] w-[100%] max-[700px]:h-[100vh]">
      <div className="h-[100%] max-w-[1000px] max-[700px]:h-[100%] max-[700px]:w-full mx-auto bg-[#424769] shadow-xl rounded-md">
        <div className="h-full flex">
          <aside className="flex flex-col items-center min-w-16 h-full py-8 overflow-y-auto bg-[transparent] border-r border-r-[#7077A1]">
            <nav className="flex flex-col flex-1 space-y-6">
              <div className="w-auto h-6 cursor-pointer">
                <svg
                  width="auto"
                  height="auto"
                  viewBox="0 0 106 85"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.7393 71.3241L3.41309 81.6338C2.15269 82.8921 0 81.9995 0 80.2184V54.488C0 52.7067 2.15331 51.8141 3.41352 53.0731L13.7393 63.3887C14.262 63.9093 14.6767 64.5277 14.9597 65.2086C15.2427 65.8894 15.3883 66.6193 15.3883 67.3564C15.3883 68.0935 15.2427 68.8234 14.9597 69.5042C14.6767 70.1851 14.262 70.8035 13.7393 71.3241Z"
                    fill="#7077A1"
                  />
                  <path
                    d="M91.3683 71.3241L101.694 81.6337C102.955 82.8921 105.108 81.9995 105.108 80.2184V54.488C105.108 52.7067 102.954 51.8141 101.694 53.0731L91.3683 63.3887C90.8456 63.9093 90.4309 64.5277 90.1479 65.2086C89.8649 65.8894 89.7192 66.6193 89.7192 67.3564C89.7192 68.0935 89.8649 68.8234 90.1479 69.5042C90.4309 70.1851 90.8456 70.8035 91.3683 71.3241Z"
                    fill="#7077A1"
                  />
                  <path
                    d="M49.7091 49.6385L6.82642 6.81672C4.30574 4.29962 0 6.0849 0 9.64715V28.0139C0 29.076 0.422407 30.0945 1.1741 30.8449L44.8945 74.4874C46.9238 76.5064 49.6719 77.6402 52.5368 77.6402C55.4017 77.6402 58.1498 76.5064 60.1791 74.4874L103.932 30.8536C104.685 30.1031 105.108 29.084 105.108 28.0213V9.65448C105.108 6.09239 100.802 4.30703 98.2813 6.8238L55.3984 49.6385C54.6437 50.3912 53.6205 50.814 52.5538 50.814C51.487 50.814 50.4638 50.3912 49.7091 49.6385Z"
                    fill="#7077A1"
                  />
                </svg>
              </div>
              <div>
                <Sidebar
                  visible={sideBarVisible}
                  onHide={() => setSideBarVisible(false)}
                  header={customHeader}
                >
                  <div>
                    <input
                      type="text"
                      onChange={(e) => setSearchText(e.target.value)}
                      value={searchText}
                      name="search"
                      className="text-input"
                    />
                    <Button
                      className="search_up_btn"
                      label="Search..."
                      onClick={() => {
                        handleSearch();
                      }}
                      loading={searching}
                    />
                    {searchResult && (
                      <div
                        className="search-result-container"
                        onClick={userSelect}
                      >
                        <div className="item-container">
                          <img src={searchResult.photoURL} alt="avater" />
                          <p>{searchResult.username}</p>
                        </div>
                        {userLoadingText && (
                          <p className="search-user-add-loading">
                            Adding User...
                          </p>
                        )}
                      </div>
                    )}
                    <br />
                    {notFound && (
                      <div className="not-found-container">
                        <span className="user-not-found">User not found!</span>
                      </div>
                    )}
                    <div className="messages-container">
                      {Object.entries(chats)
                        ?.sort((a, b) => b[1].date - a[1].date)
                        .map((chat) => {
                          return (
                            <div
                              className="message-result-container"
                              key={chat[0]}
                              onClick={() => {
                                handleSelect(chat[1].userInfo);
                              }}
                            >
                              <div className="item-container">
                                <img
                                  src={chat[1].userInfo.photoURL}
                                  alt="avater"
                                />
                                <div>
                                  <p>{chat[1].userInfo.displayName}</p>
                                  {chat[1].lastMessage && (
                                    <p className="last-message">
                                      {chat[1].lastMessage.text}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                    <p className="copyright-sec">
                      Design and Developed by{" "}
                      <a
                        href="https://www.facebook.com/abdullah.al.mridul.dev"
                        target="_blank"
                      >
                        Abdullah
                      </a>
                    </p>
                  </div>
                </Sidebar>
                <button
                  onClick={() => {
                    setSideBarVisible(true);
                  }}
                >
                  <IoMenu className="h-10 w-10 text-[#7077A1]" />
                </button>
              </div>
            </nav>
            <div className="flex flex-col space-y-6">
              <button
                onClick={() => {
                  setIsConfirmationOpen(true);
                }}
                className="text-[#7077A1] transition-colors duration-200 rotate-180"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-7 h-7 mx-auto"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                  />
                </svg>
              </button>

              <Modal
                isOpen={isConfirmationOpen}
                onClose={() => {
                  setIsConfirmationOpen(false);
                }}
              >
                <Modal.Body className="space-y-3">
                  <Modal.Icon className="icon-body">
                    <SignOut size={28} weight="fill" />
                  </Modal.Icon>
                  <Modal.Content>
                    <div className="!mb-6">
                      <h3 className="mb-2 text-body-1 font-medium text-metal-900">
                        Sign Out Confirmation
                      </h3>
                      <p className="text-body-4 font-normal text-metal-600">
                        You will be signed out from this browser, your changes
                        will be saved to our database so you will not lose any
                        data.
                      </p>
                    </div>
                  </Modal.Content>
                  <Modal.Footer>
                    <KeepButton
                      onClick={() => {
                        setIsConfirmationOpen(false);
                      }}
                      size="sm"
                      variant="outline"
                      color="secondary"
                    >
                      Cancel
                    </KeepButton>
                    <KeepButton
                      onClick={() => {
                        setIsConfirmationOpen(false);
                        auth.signOut();
                      }}
                      size="sm"
                      color="primary"
                    >
                      Confirm
                    </KeepButton>
                  </Modal.Footer>
                </Modal.Body>
              </Modal>
              <div>
                <img
                  className="object-cover w-8 h-8 rounded-full"
                  src={userContext.photoURL}
                  alt="profile-pic"
                />
              </div>
            </div>
          </aside>
          <section className="w-full flex flex-col">
            <header className="h-[60px] px-5 w-full border-b border-b-[#7077A1] flex items-center justify-between">
              <div className="flex items-center gap-[15px]">
                <Avater src={data.user?.photoURL} />
                <h3 className="font-[600] uppercase text-[#7077A1] text-[16px]">
                  {data.user?.displayName}
                </h3>
              </div>
              <div className="flex list-none gap-5 text-[#7077A1] text-[25px] items-center">
                <li>
                  <MdVideoCall />
                </li>
                <li>
                  <IoCall className="text-[20px]" />
                </li>
                <li>
                  <BsThreeDots />
                </li>
              </div>
            </header>
            <div className="flex-1 overflow-div p-3 overflow-y-scroll">
              {messages.map((m) => (
                <Message message={m} key={m.id} />
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="">
              <Input />
            </div>
          </section>
        </div>
      </div>
    </section>
  );
};
export default Chat;
// npx tailwindcss -i ./src/index.css -o ./src/tailwind_output.css --watch
