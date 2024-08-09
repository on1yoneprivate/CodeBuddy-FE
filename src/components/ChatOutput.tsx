import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface ChatOutputProps {
  chatroomId: number;
  categoryType: string;
}

const ChatOutput: React.FC<ChatOutputProps> = ({ chatroomId, categoryType }) => {
  const [output, setOutput] = useState<string>('');

  useEffect(() => {
    const fetchOutput = async () => {
      try {
        const response = await axios.get(`/main/ask/${chatroomId}`, {
          params: { categoryType },
        });
        setOutput(response.data.output);
      } catch (error) {
        console.error(error);
      }
    };

    fetchOutput();
  }, [chatroomId, categoryType]);

  return <div>{output}</div>;
};

export default ChatOutput;
