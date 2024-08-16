import React, { useState } from 'react';
import { Message } from '../types/Message';
import { IoChevronDown } from "react-icons/io5";
import './ChatInterface.css';

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
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button className="send-button" onClick={handleSendMessage}><IoChevronDown size={18}/></button>
      </div>

      <div className="message-container">
        {questions.map((q, index) => (
          <div key={index} className="message-box">
            <div><strong>Input:</strong> {q.input}</div>
            <div><strong>Output:</strong> {q.output}</div>
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default ChatInterface;
