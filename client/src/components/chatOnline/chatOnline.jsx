import axios from 'axios';
import { useEffect, useState } from 'react';
import './chatOnline.css';

export default function ChatOnline({
  onlineUsers,
  currentId,
  setCurrentChat,
  setConversation,
}) {
  const [friends, setFriends] = useState([]);
  const [onlineFriends, setOnlineFriends] = useState([]);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;

  useEffect(() => {
    const getFriends = async () => {
      const res = await axios.get('/users/friends/' + currentId);
      setFriends(res.data);
    };

    getFriends();
  }, [currentId]);

  useEffect(() => {
    setOnlineFriends(friends.filter((f) => onlineUsers.includes(f._id)));
  }, [friends, onlineUsers]);

  const handleClick = async (user) => {
    try {
      const res = await axios.get(
        `/conversation/find/${currentId}/${user._id}`
      );
      console.log('RESSSS', res);
      if (!res.data) {
        console.log('HEREEEEEEEEEEE');
        const members = {
          senderId: currentId,
          receiverId: user._id,
        };
        try {
          const newConv = await axios.post('/conversation', members);
          console.log('CONVVVVV', newConv.data);
          setCurrentChat(newConv.data);
        } catch (err) {
          console.log(err);
        }
      } else {
        console.log('ELSEEEEEEEEEEE');
        setCurrentChat(res.data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  console.log(friends);
  console.log(onlineFriends);
  console.log(onlineUsers);
  return (
    <div className="chatOnline">
      {onlineFriends.map((o) => (
        <div className="chatOnlineFriend" onClick={() => handleClick(o)}>
          <div className="chatOnlineImgContainer">
            <img
              className="chatOnlineImg"
              src={
                o?.profilePicture
                  ? PF + o.profilePicture
                  : PF + 'person/noAvatar.png'
              }
              alt=""
            />
            <div className="chatOnlineBadge"></div>
          </div>
          <span className="chatOnlineName">{o?.username}</span>
        </div>
      ))}
    </div>
  );
}
