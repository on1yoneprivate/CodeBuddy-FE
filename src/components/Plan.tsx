import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import ChatInterface from '../components/ChatInterface';
import AnswerArea from '../components/AnswerArea';
import Sidebar from '../components/Sidebar';
import { Message } from '../types/Message';
import { fetchWithToken } from '../api/fetchWithToken';
import { ChatroomProps, QuestionTitle } from '../types/ChatroomProps';
import { useChatroom } from '../context/ChatroomContext';
import { handleNewChatroom } from '../utils/chatUtils';
import { BsSendPlus } from "react-icons/bs";
import { MdOutlineSaveAlt } from "react-icons/md";
import LogoutButton from './Logout';

const PlanContainer = styled.div`
  display: relative;
`;

const MainContent = styled.div`
  flex-grow: 1;
  padding: 20px;
  margin-left: 200px; /* 사이드바 너비를 고려한 여백 */
  display: relative;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const StyledSidebar = styled(Sidebar)`
  position: fixed;
  left: 0;
  bottom: 0;
  top: 0;
  height: 100%;
  width: 200px; /* 사이드바 너비 */
  background-color: #f0f0f0;
  border-right: 1px solid #ddd;
  padding: 20px; /* 사이드바 내부 패딩 (선택 사항) */
`;

const NewChatButton = styled.button`
  position: fixed;
  left: 250px; /* 사이드바의 오른쪽 외부에 위치 */
  top: 10px;
  padding: 10px 20px;
  background-color: transparent;
  color: #CCCCCC;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    color: #006FFF;
  }

  svg {
    width: 24px;
    height: 24px;
  }

  .button-new {
    list-style: none;
    padding: 0;
    margin: 0;
    visibility: hidden; /* 기본적으로 숨김 */
    opacity: 0;
    transition: visibility 0s, opacity 0.3s ease-in-out; /* 애니메이션 효과 추가 */
  }

  &:hover .button-new {
    visibility: visible; /* hover 시 보이도록 설정 */
    opacity: 1;
  }
`;

const SaveChatButton = styled.button`
  position: fixed;
  left: 320px;
  top: 10px;
  padding: 10px 20px;
  background-color: transparent;
  color: #CCCCCC;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    color: #006FFF;
  }

  svg {
    width: 24px;
    height: 24px;
  }

  .button-save {
    list-style: none;
    padding: 0;
    margin: 0;
    visibility: hidden; /* 기본적으로 숨김 */
    opacity: 0;
    transition: visibility 0s, opacity 0.3s ease-in-out; /* 애니메이션 효과 추가 */
  }

  &:hover .button-save {
    visibility: visible; /* hover 시 보이도록 설정 */
    opacity: 1;
  }
`;


const Plan: React.FC<ChatroomProps> = ({ questionTitles, questions: initialQuestions, fetchQuestionTitles, category }) => {
  const [questions, setQuestions] = useState<Message[]>(initialQuestions);
  const [currentChatroomId, setCurrentChatroomId] = useState<number>(1); // 초기 값 1으로 설정
  const [sidebarData, setSidebarData] = useState<QuestionTitle[]>(questionTitles); // 사이드바에 표시할 데이터
  const [categoryChatroomIds, setCategoryChatroomIds] = useState<{ [key: string]: number }>({});

  const chatroomContext = useChatroom();

  useEffect(() => {
    const storedLoginId = localStorage.getItem('loginId');
    if (storedLoginId) {
      console.log('Stored loginId:', storedLoginId);
      const storedSidebarData = localStorage.getItem('sidebarData');
      if (storedSidebarData) {
        setSidebarData(JSON.parse(storedSidebarData));
      } else {
        fetchInitialData(storedLoginId, category);
      }
    } else {
      console.error('로그인된 사용자가 없습니다.');
    }
  }, [category]);

  useEffect(() => {
    if (category) {
      if (categoryChatroomIds[category]) {
        setCurrentChatroomId(categoryChatroomIds[category]);
      } else {
        const newChatroomId = chatroomContext.chatroomCounter + 1;
        setCategoryChatroomIds(prev => ({ ...prev, [category]: newChatroomId }));
        chatroomContext.setChatroomCounter(newChatroomId);
        setCurrentChatroomId(newChatroomId);
      }
    }
  }, [category, chatroomContext.chatroomCounter, chatroomContext.setChatroomCounter, categoryChatroomIds]);

  useEffect(() => {
    localStorage.setItem('sidebarData', JSON.stringify(sidebarData));
  }, [sidebarData]);

  const fetchInitialData = async (userId: string, categoryType: string) => {
    try {
      const [chatroomResponse, savedDataResponse] = await Promise.all([
        fetchWithToken(`/chatrooms/titles?userId=${userId}&categoryType=${categoryType}`, {
          method: 'GET',
        }),
        fetchWithToken(`/main/plan/saved?userId=${userId}`, {
          method: 'GET',
        }),
      ]);

      const chatroomData = await chatroomResponse.json();
      const savedData = await savedDataResponse.json();

      if (chatroomData.success) {
        setSidebarData(Object.entries(chatroomData.data).map(([chatroomId, title]: [string, any]) => ({
          chatroomId: parseInt(chatroomId, 10),
          title,
          category: categoryType,
        })));
      }

      const { savedQuestions } = savedData;
      setSidebarData(prevData => [
        ...prevData,
        ...savedQuestions.map((q: { content: string }) => ({
          chatroomId: parseInt(q.content, 10) || 0,
          title: (q.content || 'No content').trim().substring(0, 10),
          category: 'plan',
        })),
      ]);
    } catch (error) {
      console.error('초기 데이터를 불러오는 데 실패했습니다.', error);
    }
  };


  const handleSidebarClick = async (chatroomId: number, category: string) => {
    console.log(`Sidebar item clicked: ${chatroomId}`);
    
    // 현재 채팅방 ID를 설정
    setCurrentChatroomId(chatroomId);
    // 새로운 채팅방을 클릭할 때 이전 질문들을 초기화
    setQuestions([]);

    try {
        const response = await fetchWithToken(`/chats/${chatroomId}`, {
            method: 'GET',
        });

        const responseData = await response.json();
        if (response.ok && responseData.success) {
            const questionsData: Message[] = [];
            
            // responseData는 질문과 답변을 리스트 형태로 가짐
            for (let i = 0; i < responseData.data.length; i += 2) {
                const question = responseData.data[i] as string;
                const answer = responseData.data[i + 1] as string;

                questionsData.push({
                    chatroomId,
                    type: "text", // 여기서 type을 'text'로 명시적으로 설정
                    input: question,
                    output: answer
                });
            }

            // 가져온 질문들로 상태를 업데이트
            setQuestions(questionsData);

            localStorage.setItem(`chatroom-${chatroomId}`, JSON.stringify({ questions: questionsData }));
            console.log('채팅방 데이터를 서버에서 불러오기 성공');
        } else {
            console.error('서버에서 데이터를 불러오는 데 실패했습니다.');
            setQuestions([]); // 데이터 가져오기 실패 시 질문 초기화
        }
    } catch (error) {
        console.error('An error occurred while fetching chatroom data:', error);
        setQuestions([]); // 오류 발생 시 질문 초기화
    }
};


  const handleSaveChatroom = async () => {
    try {
      const apiUrl = `/save/${currentChatroomId}`;
      const response = await fetchWithToken(apiUrl, {
        method: 'PUT'
      });

      if (!response.ok) {
        throw new Error('Failed to save chatroom');
      }

      // 사이드바에 제목 저장
      const newSidebarItem: QuestionTitle = {
        chatroomId: currentChatroomId,
        title: questions[0]?.input.substring(0, 10) || 'No title',
        category,
      };

      setSidebarData(prevSidebarData => [...prevSidebarData, newSidebarItem]);
      localStorage.setItem(`chatroom-${currentChatroomId}`, JSON.stringify({ questions }));
      localStorage.setItem('sidebarData', JSON.stringify([...sidebarData, newSidebarItem]));

      console.log('채팅방이 저장되었습니다.', { questions });
    } catch (error) {
      console.error('Error saving chatroom:', error);
    }
  };

  const handleNewMessage = async (message: Message[]) => {
    if (category === null) {
      console.error('No category available for sending a message.');
      return;
    }

    try {
      const apiUrl = `/main/ask/${currentChatroomId}?categoryType=${category.toUpperCase()}`;
      const response = await fetchWithToken(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: message[0].input,
        }),
      });

      const responseText = await response.text();

      try {
        const responseLines = responseText.split('\n').filter(line => line.trim() !== '');
        const responseData = responseLines
          .filter(line => line.startsWith('data:'))
          .map(line => {
            try {
              const jsonString = line.replace(/^data:/, '').trim();
              return JSON.parse(jsonString);
            } catch (jsonParseError) {
              console.error('JSON Parse error for line:', line);
              return null;
            }
          })
          .filter(item => item !== null);

        const responseMessageContent = responseData.map((item: { content: string }) => item.content).join('');
        const responseMessage: Message = {
          chatroomId: currentChatroomId,
          type: 'text',
          input: message[0].input,
          output: responseMessageContent,
        };
        setQuestions(prevQuestions => [...prevQuestions, responseMessage]);

        localStorage.setItem(`chatroom-${currentChatroomId}`, JSON.stringify({ questions: [...questions, responseMessage] }));

        console.log('질문에 대한 응답을 받았습니다.', responseMessage);
      } catch (parseError) {
        console.error('JSON Parse error:', parseError, 'Response Text:', responseText);
      }
    } catch (error) {
      console.error('Error generating response:', error);
    }
  };

  const handleDeleteClick = async (chatroomId: number) => {
    try {
      const response = await fetchWithToken(`/delete/${chatroomId}`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      setSidebarData(prevSidebarData => prevSidebarData.filter(item => item.chatroomId !== chatroomId));
      localStorage.removeItem(`chatroom-${chatroomId}`);
      console.log('저장된 채팅방을 삭제합니다.', `chatroomId: ${chatroomId}`);
    } catch (error) {
      console.error('Error deleting chatroom:', error);
    }
  };

  return (
    <PlanContainer>
      <StyledSidebar
        questionTitles={sidebarData}
        onItemClick={(id: number, category: string) => handleSidebarClick(id, category)}
        onDeleteClick={handleDeleteClick}
      />
      <MainContent>
        <NewChatButton onClick={() => handleNewChatroom(category, categoryChatroomIds, setCategoryChatroomIds, chatroomContext, setCurrentChatroomId, setQuestions)}>
          <BsSendPlus />
          <ul className="button-new">
            <li> new chatroom </li>
          </ul>
        </NewChatButton>
        <SaveChatButton onClick={handleSaveChatroom}>
          <MdOutlineSaveAlt size={12}/>
          <ul className="button-save">
              <li>save</li>
            </ul>
        </SaveChatButton>
        <FixedChatInterface
          chatroomId={currentChatroomId}
          onNewMessage={handleNewMessage}
          category={category}
          questions={questions}
        />
        {questions && questions.length > 0 ? (
          <AnswerArea messages={questions.filter(q => q.chatroomId === currentChatroomId)} onSave={handleSaveChatroom} />
        ) : (
          <p>No messages available.</p>
        )}
      </MainContent>
      <LogoutButton />
    </PlanContainer>
  );
};

export default Plan;

const FixedChatInterface = styled(ChatInterface)`
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  border-radius: 8px;
  background-color: #f9f9f9;
  z-index: 1000; /* 다른 요소 위에 표시되도록 */
`;