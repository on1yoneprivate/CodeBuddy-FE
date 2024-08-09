import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

interface Chatroom {
  id: number;
  title: string;
}

const SavedChatroomList: React.FC = () => {
  const [chatrooms, setChatrooms] = useState<Chatroom[]>([]);
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const userId = query.get('userId');
  const categoryType = query.get('categoryType');

  useEffect(() => {
    axios.get(`/chatrooms/titles?userId=${userId}&categoryType=${categoryType}`)
      .then(response => {
        setChatrooms(response.data);
      });
  }, [userId, categoryType]);

  return (
    <div>
      <h1>Chatrooms</h1>
      <ul>
        {chatrooms.map(chatroom => (
          <li key={chatroom.id}>
            <Link to={`/main/ask/${chatroom.id}?categoryType=${categoryType}`}>
              {chatroom.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SavedChatroomList;
