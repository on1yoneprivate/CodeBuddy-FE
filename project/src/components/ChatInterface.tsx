import React, { useEffect, useState } from 'react';
import { Message } from '../types/Message';

interface ChatInterfaceProps {
  chatroomId: string;
  onNewMessage: (messages: Message[]) => void;
  // handleSaveToSidebar: (title: string) => void;
  category: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatroomId, onNewMessage, category }) => {
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

    onNewMessage([newMessage]);
    /* if (saveToSidebar) {
      handleSaveToSidebar(input);
    }*/
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
        onKeyPress={handleKeyPress} // Enter 키 이벤트 핸들러 추가
      />
      <div>
        <input
          type="checkbox"
          checked={saveToSidebar}
          onChange={(e) => setSaveToSidebar(e.target.checked)}
        />
        <label>사이드바에 저장</label>
      </div>
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default ChatInterface;
