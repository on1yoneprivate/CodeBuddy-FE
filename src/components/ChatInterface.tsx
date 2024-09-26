import React, { useEffect, useRef, useState } from 'react';
import { Message } from '../types/Message';
import { IoChevronDown } from "react-icons/io5";
import { RiQuestionAnswerFill, RiQuestionAnswerLine } from "react-icons/ri";
import './ChatInterface.css';
import { SyncLoader } from 'react-spinners';
import axios from 'axios';
import Checkbox from './CheckBox'; // Checkbox 컴포넌트 import
import { fetchWithToken } from '../api/fetchWithToken';

interface ChatInterfaceProps {
  chatroomId: number;
  onNewMessage: (messages: Message[], saveToSidebar: boolean) => void;
  category: string;
  questions: Message[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatroomId, onNewMessage, category, questions }) => {
  const [input, setInput] = useState('');
  const [saveToSidebar, setSaveToSidebar] = useState(false);
  const [loading, setLoading] = useState(false);
  const outputAreaRef = useRef<HTMLDivElement>(null);
  const [checkedMessages, setCheckedMessages] = useState<boolean[]>(Array(questions.length).fill(false)); // 체크 상태 관리

  const handleSendMessage = () => {
    if (input.trim() === '') return;

    setLoading(true);

    const newMessage: Message = {
      chatroomId,
      type: 'text',
      input,
      output: `Response for: ${input}`
    };

    onNewMessage([newMessage], saveToSidebar);
    setInput('');
    setLoading(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleCheckboxChange = async (index: number, isChecked: boolean) => {
    const updatedCheckedMessages = [...checkedMessages];
    updatedCheckedMessages[index] = isChecked; // true 또는 false로 상태 업데이트
    setCheckedMessages(updatedCheckedMessages);
  
    try {
      // 서버에 true/false 상태 전송
      const response = await fetchWithToken(`/chat/retrospect/${chatroomId}`, {
        method: 'POST', // POST 메소드 사용
        headers: {
          'Content-Type': 'application/json', // JSON 형식으로 전송
        },
        body: JSON.stringify({
          checked: isChecked, // true 또는 false로 전송
        }),
      });
  
      if (response.ok) {
        console.log(`Successfully updated message at index ${index} state to ${isChecked}`);
      } else {
        console.error('Failed to update checkbox status');
      }
    } catch (error) {
      console.error('Error updating checkbox status:', error);
    }
  };
  

  useEffect(() => {
    if (outputAreaRef.current) {
      outputAreaRef.current.scrollTop = outputAreaRef.current.scrollHeight;
    }
  }, [questions]);

  return (
    <div>
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="input-field"
          placeholder='요구 사항을 입력하세요.'
        />
        <button className="send-button" onClick={handleSendMessage} disabled={loading}>
          {loading ? <SyncLoader color="#006FFF" size={8} /> : <IoChevronDown />}
        </button>
      </div>
      <div>
      </div>
      <div className="message-container" ref={outputAreaRef}>
        {questions.map((q, index) => (
          <div key={index} className="message-box">
            <div className="input-container">
              <div className="input-box"><RiQuestionAnswerFill /> {q.input}</div>
            </div>
            <div className="output-container">
              {q.type === 'text' ? (
                <div className="output-box">
                  <Checkbox
                    checked={checkedMessages[index]} // 체크박스 상태
                    onChange={(isChecked) => handleCheckboxChange(index, isChecked)} // 상태 변경 핸들러
                  /> {q.output}
                </div>
              ) : q.type === 'image' && q.output ? (
                <div className="output-box">
                  <img src={`data:image/png;base64,${q.output}`} alt={q.description || 'Image'} className="output-image"
                    style={{ maxWidth: "100%", height: "auto" }} />
                  {q.description && <p className="image-description">{q.description}</p>}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatInterface;