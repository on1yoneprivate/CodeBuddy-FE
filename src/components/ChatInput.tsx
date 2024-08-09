import React, { useState } from 'react';
import axios from 'axios';

interface ChatInputProps {
  chatroomId: number;
  categoryType: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ chatroomId, categoryType }) => {
  const [inputValue, setInputValue] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/main/ask/${chatroomId}`, {
        categoryType,
        input: inputValue,
      });
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button type="submit">Send</button>
    </form>
  );
};

export default ChatInput;
