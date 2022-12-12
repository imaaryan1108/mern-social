import React, { useContext, useEffect, useState, useRef } from 'react';
import Conversation from '../../components/conversation/Conversation';
import Message from '../../components/message/Message';
import Topbar from '../../components/topbar/Topbar';
import './Messenger.css';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import ChatOnline from '../../components/chatOnline/chatOnline';

function Messenger() {
  const [conversation, setConversation] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const user = useContext(AuthContext);

  const scrollRef = useRef();
  const socket = useRef();

  useEffect(() => {
    socket.current = io('http://localhost:8990');
    socket.current.on('getMessage', (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, []);

  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await axios.get('/conversation/' + user?.user._id);
        setConversation(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getConversations();
  }, [user]);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = await axios.get('/message/' + currentChat?._id);
        setMessages(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getMessages();
  }, [currentChat]);

  useEffect(() => {
    arrivalMessage && currentChat?.members.includes(arrivalMessage.sender);
    setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    socket.current.emit('addUser', user.user._id);
    socket.current.on('getUsers', (users) => {
      console.log('-----------', user);
      user &&
        setOnlineUsers(
          user?.user.followings.filter((f) =>
            users.some((u) => u?.userId === f)
          )
        );
    });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = {
      sender: user.user._id,
      text: newMessage,
      conversationId: currentChat._id,
    };
    console.log(currentChat);
    const recieverId = currentChat.members.find(
      (member) => member !== user.user._id
    );

    socket.current.emit('sendMessage', {
      senderId: user.user._id,
      recieverId,
      text: newMessage,
    });

    try {
      const res = await axios.post('/message', message);
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      <Topbar />
      <div className="messenger">
        <div className="chatMenu">
          <div className="chatMenuWrapper">
            <input placeholder="Search for friends" className="chatMenuInput" />
            {conversation.map((c) => (
              <div onClick={() => setCurrentChat(c)}>
                <Conversation conversation={c} currentUser={user} />
              </div>
            ))}
          </div>
        </div>
        <div className="chatBox">
          <div className="chatBoxWrapper">
            {currentChat ? (
              <>
                <div className="chatBoxTop">
                  {messages.map((m) => (
                    <div ref={scrollRef}>
                      <Message
                        key={m._id}
                        message={m}
                        own={m.sender === user.user._id}
                      />
                    </div>
                  ))}
                </div>

                <div className="chatBoxBottom">
                  <textarea
                    className="chatMessageInput"
                    placeholder="write something.."
                    onChange={(e) => setNewMessage(e.target.value)}
                    value={newMessage}
                  ></textarea>
                  <button className="chatSubmitButton" onClick={handleSubmit}>
                    Send
                  </button>
                </div>
              </>
            ) : (
              <span className="noConversationText">
                Open a conversation to start chat
              </span>
            )}
          </div>
        </div>
        <div className="chatOnline">
          <div className="chatOnlineWrapper">
            <ChatOnline
              onlineUsers={onlineUsers}
              currentId={user.user._id}
              setCurrentChat={setCurrentChat}
              setConversation={setConversation}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Messenger;
