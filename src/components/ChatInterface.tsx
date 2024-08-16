import React, { useState } from 'react';
import { Message } from '../types/Message';
import { IoChevronDown } from "react-icons/io5";

interface ChatInterfaceProps {
  chatroomId: number;
  onNewMessage: (messages: Message[], saveToSidebar: boolean) => void;
  category: string;
  questions: Message[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatroomId, onNewMessage, category, questions}) => {
  const [input, setInput] = useState('');
  const [saveToSidebar, setSaveToSidebar] = useState(false);

  const handleSendMessage = () => {
    if (input.trim() === '') return;

    const newMessage: Message = {
      chatroomId,
      type: 'text',
      input,
      output: `Response for: ${input}`
    };

    onNewMessage([newMessage], saveToSidebar);
    setInput('');
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <div>
      </div>
      <button onClick={handleSendMessage}><IoChevronDown /></button>

      <ul>
        {questions.map((q, index) => (
          <li key={index}>
            <div>Input: {q.input}</div>
            <div>Output: {q.output}</div>
          </li>
        ))}
      </ul>
      
    </div>
  );
};

export default ChatInterface;
