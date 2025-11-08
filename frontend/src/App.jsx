// App.js - Updated with proper state management
import "./App.css"
import Sidebar from './Sidebar'
import ChatWindow from './ChatWindow'
import { MyContext } from './MyContext'
import { useEffect, useState } from "react"
import { v1 as uuidv1 } from "uuid"
import AuthPage from "./AuthPage"

const App = () => {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]); // stores all chats of curr threads
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setALLThreads] = useState([]);

  // Authentication states
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);


  useEffect(() => {
    // Load from localStorage when the app starts
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('authUser');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Logout function
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    // Reset chat states
    setPrompt("");
    setReply(null);
    setCurrThreadId(uuidv1());
    setPrevChats([]);
    setNewChat(true);
    setALLThreads([]);

    // Disable Google auto-select
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const providerValues = {
    prompt, setPrompt,
    reply, setReply,
    currThreadId, setCurrThreadId,
    newChat, setNewChat,
    prevChats, setPrevChats,
    allThreads, setALLThreads,
    // Add authentication values
    user,
    token,
    handleLogout
  };

  // Login screen
  if (!user) {
    return (
      <AuthPage setUser={setUser} setToken={setToken} />
    );
  }

  // Main app (after login)
  return (
    <div className='app'>
      <MyContext.Provider value={providerValues}>
        <Sidebar />
        <ChatWindow />
      </MyContext.Provider>
    </div>
  )
}

export default App