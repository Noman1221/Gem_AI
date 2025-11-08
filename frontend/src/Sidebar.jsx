import { useContext, useEffect, useState } from "react";
import { v1 as uuidv1 } from "uuid";
import { MyContext } from "./MyContext";
import "./Sidebar.css";
const API = import.meta.env.VITE_API_URL;
//  || "https://gemai-a-smart-writing-assistant.onrender.com/api";
const Sidebar = () => {
  const { allThreads, setALLThreads, setNewChat, currThreadId, setPrompt, setReply, setCurrThreadId, prevChats, setPrevChats, user, handleLogout } = useContext(MyContext);
  const [isLoadingThread, setIsLoadingThread] = useState(false);

  const getUserThreads = async () => {
    try {
      const response = await fetch(`${API}/api/threads`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      const res = await response.json();
      const filteredData = res.map(thread => (
        {
          threadId: thread.threadId,
          title: thread.title
        }
      ))

      // console.log(filteredData);
      setALLThreads(filteredData)

    } catch (error) {
      console.log(error);

    }
  }

  useEffect(() => {
    getUserThreads();
  }, [currThreadId])

  //create a new chat button
  const createNewChat = () => {
    setNewChat(true)
    setPrompt("");
    setReply([]);
    setCurrThreadId(uuidv1());
    setPrevChats([])
  }

  // get thread by the id / to click on the title
  const getThread = async (threadId) => {
    setIsLoadingThread(true);
    setCurrThreadId(threadId);
    try {
      const response = await fetch(`${API}/api/thread/${threadId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const res = await response.json();

      setPrevChats(res);
      setNewChat(false);
      setReply(null);
      setIsLoadingThread(false);
    } catch (error) {
      console.log("error in getThread function:", error);
    }
  }

  //delete thread by threadId(uuid)
  const deleteThread = async (threadId) => {
    try {
      const response = await fetch(`${API}/api/thread/${threadId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        method: "DELETE"
      })
      const res = await response.json();
      console.log(res);

      //updated thread re-render
      setALLThreads(prev => prev.filter(thread => thread.threadId !== threadId));

      if (threadId === currThreadId) {
        createNewChat();
      }
    } catch (error) {
      console.log("error in deleteThread function:", error);
    }
  }
  return (
    <section className="sidebar">
      {/* new chat btn */}
      <div className="logoDiv">
        <img src="/gemAILogo.png" alt="logo" className="logo1" />
      </div>
      <button onClick={createNewChat}>
        {/* <img src="/gemAILogo.png" alt="logo" className="logo" /> */}
        <p>New Chat</p>
        <span><i className="fa-solid fa-pen-to-square"></i></span>
      </button>

      {/* history */}
      <ul className="history">

        {
          allThreads?.map((thread, idx) => (
            <li onClick={() => getThread(thread.threadId)} key={idx}
              className={thread.threadId === currThreadId ? "highlighted" : ""}
            >

              {thread.title}
              <i className="fa-solid fa-trash"
                onClick={(e) => {
                  e.stopPropagation(); //stop event bubbling
                  deleteThread(thread.threadId);
                }}
              ></i>
            </li>
          ))
        }
      </ul>


      {/* sign app owner */}
      <div className="sign">
        {user && (
          <div className="sidebar-user">
            <span className="user-circle">{user.name.charAt(0).toUpperCase()}</span>
            <p className="username">{user.name}</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default Sidebar

