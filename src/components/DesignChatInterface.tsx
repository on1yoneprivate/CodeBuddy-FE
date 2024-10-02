import React, { useEffect, useRef, useState } from 'react';
import { Message } from '../types/Message';
import { IoChevronDown } from "react-icons/io5";
import { RiQuestionAnswerFill } from "react-icons/ri";
import './ChatInterface.css';
import { SyncLoader } from 'react-spinners';
import Checkbox from './CheckBox'; // Checkbox 컴포넌트 import
import { fetchWithToken } from '../api/fetchWithToken';

interface DesignChatInterfaceProps {
  chatroomId: number;
  onNewMessage: (messages: Message[], saveToSidebar: boolean) => void;
  questions: Message[];
}

const DesignChatInterface: React.FC<DesignChatInterfaceProps> = ({ chatroomId, onNewMessage, questions }) => {
  const [input, setInput] = useState('');
  const [saveToSidebar, setSaveToSidebar] = useState(false);
  const [loading, setLoading] = useState(false);
  const outputAreaRef = useRef<HTMLDivElement>(null);
  const [checkedMessages, setCheckedMessages] = useState<boolean[]>(Array(questions.length).fill(false)); // 체크 상태 관리

  // 질문이 변경될 때마다 체크박스 상태를 질문 배열 길이에 맞춰 초기화
  useEffect(() => {
    setCheckedMessages(Array(questions.length).fill(false));
  }, [questions]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    setLoading(true); // 로딩 상태 시작

    try {
      const newMessage: Message = {
        chatroomId,
        type: 'text',
        input,
        output: `Response for: ${input}`,
      };

      // 서버에 메시지 보내기
      onNewMessage([newMessage], saveToSidebar);
      setInput(''); // 입력 필드 초기화
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false); // 로딩 상태 해제
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  // chatId를 가져오는 함수
  const fetchChatId = async (chatroomId: string, categoryType: string) => {
    try {
      const response = await fetchWithToken(`/chats/${chatroomId}?categoryType=${categoryType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.data; // 전체 데이터 반환
      } else {
        const errorMessage = await response.text();
        console.error('Failed to fetch chatId for categoryType:', categoryType, 'Error:', errorMessage);
        return null;
      }
    } catch (error) {
      console.error('Error fetching chatId for categoryType:', categoryType, 'Error:', error);
      return null;
    }
  };

  // handleCheckboxChange 함수
  const handleCheckboxChange = async (index: number, chatroomId: string, categoryType: string) => {
    let chatId: string | null = null;

    try {
      const data = await fetchChatId(chatroomId, categoryType);

      if (!data || !data[index]) {
        console.error(`No chatId found for index ${index} and categoryType: ${categoryType}`);
        return;
      }

      chatId = data[index].chatId;
      // chatId가 null이 아닌지 확인
      if (chatId === null) {
        console.error('chatId is null');
        return;
      }

      // +2 값을 적용
      // chatId : 사용자 입력값
      // chatId+1 : 생성된 이미지
      // chatId+2 : 이미지에 대한 설명 (텍스트)
      const modifiedChatId = parseInt(chatId, 10) + 2;

      // 체크박스 상태 업데이트
      const updatedCheckedMessages = [...checkedMessages];
      const newCheckedState = !updatedCheckedMessages[index];
      updatedCheckedMessages[index] = newCheckedState;
      setCheckedMessages(updatedCheckedMessages);

      // 서버에 상태 전송
      const response = await fetchWithToken(`/chat/retrospect/${modifiedChatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checked: newCheckedState, // 선택 여부를 서버에 전달
        }),
      });

      if (response.ok) {
        console.log(`Successfully updated message at index ${index} for chatId: ${chatId}`);
      } else {
        const errorMessage = await response.text();
        console.error('Failed to update checkbox status for chatId:', chatId, 'Error:', errorMessage);
      }
    } catch (error) {
      console.error('Error updating checkbox status for chatId:', chatId, 'Error:', error);
    }
  };

  useEffect(() => {
    if (outputAreaRef.current) {
      outputAreaRef.current.scrollTop = outputAreaRef.current.scrollHeight; // 새로운 메시지가 추가될 때마다 스크롤을 맨 아래로
    }
  }, [questions]);

  const renderMessages = () => {
    return questions.map((question, index) => (
      <div key={index} className="message-box">
        <div className="input-container">
          <div className="input-box">
            <RiQuestionAnswerFill /> {question.input}
          </div>
        </div>
        <div className="output-container">
          <Checkbox
            checked={checkedMessages[index]} // 체크박스 상태
            onChange={() => handleCheckboxChange(index, chatroomId.toString(), 'DESIGN')} // 상태 변경 핸들러
          /> 
          <div className="output-box">
            {question.type === 'image' ? (
              <>
                <img 
                  src={`data:image/png;base64,${question.output}`} 
                  alt="Generated Design" 
                  style={{ maxWidth: '100%', height: 'auto' }} 
                />
                {/* 이미지 아래 설명 텍스트 */}
                {question.description && (
                  <div dangerouslySetInnerHTML={{ __html: question.description }} />
                )}
              </>
            ) : (
              <div>{question.output}</div>
            )}
          </div>
        </div>
      </div>
    ));
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
          placeholder='디자인 요청 사항을 입력하세요.'
        />
        <button className="send-button" onClick={handleSendMessage} disabled={loading}>
          {loading ? <SyncLoader color="#006FFF" size={8} /> : <IoChevronDown />}
        </button>
      </div>
      <div className="message-container" ref={outputAreaRef}>
        {renderMessages()}
      </div>
    </div>
  );
};

export default DesignChatInterface;