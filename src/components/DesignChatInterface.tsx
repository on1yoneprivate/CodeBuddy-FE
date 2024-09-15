import React, { useEffect, useRef, useState } from 'react';
import { Message } from '../types/Message';
import { IoChevronDown } from "react-icons/io5";
import { RiQuestionAnswerFill, RiQuestionAnswerLine } from "react-icons/ri";
import './ChatInterface.css';

interface DesignChatInterfaceProps {
  chatroomId: number;
  onNewMessage: (messages: Message[], saveToSidebar: boolean) => void;
  category: string;
  questions: Message[];
}

const DesignChatInterface: React.FC<DesignChatInterfaceProps> = ({ chatroomId, onNewMessage, category, questions }) => {
  const [input, setInput] = useState('');
  const [saveToSidebar, setSaveToSidebar] = useState(false);
  const outputAreaRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (outputAreaRef.current) {
      outputAreaRef.current.scrollTop = outputAreaRef.current.scrollHeight;
    }
  }, [questions]);

  const renderOutput = (output: string | { imageSrc: string; description: string }) => {
    if (typeof output === 'string') {
      return <div className="output-box"><RiQuestionAnswerLine /> {output}</div>;
    } else {
      return (
        <div className="output-box">
          <img src={output.imageSrc} alt="Generated" className="output-image" />
          <p>{output.description}</p>
        </div>
      );
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
          className="input-field"
        />
        <button className="send-button" onClick={handleSendMessage}><IoChevronDown /></button>
      </div>
      <div className="message-container" ref={outputAreaRef}>
        {questions.map((q, index) => (
          <div key={index} className="message-box">
            <div className="input-container">
              <div className="input-box"><RiQuestionAnswerFill /> {q.input}</div>
            </div>
            <div className="output-container">
              {renderOutput(q.output)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DesignChatInterface;
