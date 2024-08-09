import React, { useEffect, useState } from 'react';
import { QuestionTitle } from '../types/ChatroomProps';
import { fetchWithToken } from '../api/fetchWithToken';
import styled from 'styled-components';
import ChatInterface from './ChatInterface';
import AnswerArea from './AnswerArea';
import Sidebar from './Sidebar';
import LogoutButton from './Logout';
import { useChatroom } from '../context/ChatroomContext';
import { handleNewChatroom } from '../utils/chatUtils';
import { Message } from '../types/Message';

interface ChatComponentProps {
  category: string;
  initialQuestions: Message[];
  initialSidebarData: QuestionTitle[];
  userId: string;
  onCategoryChange: (category: string) => void;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ category, initialQuestions, initialSidebarData, userId, onCategoryChange }) => {
  const [questions, setQuestions] = useState<Message[]>(initialQuestions);
  const [currentChatroomId, setCurrentChatroomId] = useState<number>(1);
  const [sidebarData, setSidebarData] = useState<QuestionTitle[]>(initialSidebarData);
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
    setCurrentChatroomId(chatroomId);
    onCategoryChange(category); // Update the category
    try {
      const storedData = localStorage.getItem(`chatroom-${chatroomId}`);
      if (storedData) {
        const { questions } = JSON.parse(storedData);
        setQuestions(questions);
        console.log('채팅방 데이터를 로컬 스토리지에서 불러오기 성공');
      } else {
        const response = await fetchWithToken(`/chats/${chatroomId}`, {
          method: 'GET',
        });

        const responseData = await response.json();
        if (response.ok) {
          setQuestions(responseData.data.questions);
          localStorage.setItem(`chatroom-${chatroomId}`, JSON.stringify({ questions: responseData.data.questions }));
          console.log('채팅방 데이터를 서버에서 불러오기 성공');
        } else {
          console.error('서버에서 데이터를 불러오는 데 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('로컬 스토리지에서 데이터를 불러오는 데 실패했습니다.', error);
    }
  };

  const handleSaveToSidebar = (title: string) => {
    if (currentChatroomId === 0) {
      console.error('No chatroom ID available for saving.');
      return;
    }
    const newSidebarItem: QuestionTitle = { chatroomId: currentChatroomId, title, category };

    setSidebarData(prevSidebarData => [...prevSidebarData, newSidebarItem]);
    localStorage.setItem(`chatroom-${currentChatroomId}`, JSON.stringify({ questions }));
    console.log('사이드바에 데이터 나타내기 성공', `chatroomId: ${currentChatroomId}`);
  };

  const handleSave = async (chatroomId: number) => {
    try {
      const apiUrl = `/save/${chatroomId}`;
      const response = await fetchWithToken(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questions }),
      });

      if (!response.ok) {
        throw new Error('Failed to save chatroom');
      }

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

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let responseText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        responseText += decoder.decode(value, { stream: true });

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

        setQuestions(prevQuestions => {
          const updatedQuestions = [...prevQuestions];
          const lastIndex = updatedQuestions.findIndex(q => q.input === message[0].input);
          if (lastIndex !== -1) {
            updatedQuestions[lastIndex].output = responseMessageContent;
          } else {
            updatedQuestions.push(responseMessage);
          }
          return updatedQuestions;
        });

        const newSidebarItem: QuestionTitle = {
          chatroomId: currentChatroomId,
          title: message[0].input.substring(0, 10),
          category,
        };

        setSidebarData(prevSidebarData => {
          const updatedSidebarData = [...prevSidebarData];
          if (!updatedSidebarData.some(item => item.title === newSidebarItem.title && item.chatroomId === newSidebarItem.chatroomId)) {
            updatedSidebarData.push(newSidebarItem);
          }
          return updatedSidebarData;
        });

        localStorage.setItem(`chatroom-${currentChatroomId}`, JSON.stringify({ questions: [...questions, responseMessage] }));

        console.log('질문에 대한 응답을 받았습니다.', responseMessage);
        console.log('새로운 입력값이 추가되었습니다: ', newSidebarItem);
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
    <PlanPageContainer>
      <StyledSidebar
        questionTitles={sidebarData}
        onItemClick={handleSidebarClick}
        onDeleteClick={handleDeleteClick}
      />
      <MainContent>
        <NewChatButton onClick={() => handleNewChatroom(category, categoryChatroomIds, setCategoryChatroomIds, chatroomContext, setCurrentChatroomId, setQuestions)}>
          새로운 채팅방 생성
        </NewChatButton>
        {currentChatroomId !== 0 ? (
          <>
            <ChatInterface
              chatroomId={currentChatroomId}
              onNewMessage={handleNewMessage}
              category={category}
              questions={questions}

            />
            <AnswerArea messages={questions.filter(q => q.chatroomId === currentChatroomId)} onSave={() => handleSave(currentChatroomId)} />
          </>
        ) : (
          <>
            <ChatInterface
              chatroomId={0}
              onNewMessage={handleNewMessage}
              category={category}
              questions={questions}

            />
            <AnswerArea messages={questions} onSave={() => console.log('No chatroom to save')} />
          </>
        )}
      </MainContent>
      <LogoutButton />
    </PlanPageContainer>
  );
};

const PlanPageContainer = styled.div`
  display: flex;
`;

const MainContent = styled.div`
  flex-grow: 1;
  padding: 20px;
  margin-left: 200px;
  display: flex;
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
  width: 200px;
  background-color: #f0f0f0;
  border-right: 1px solid #ddd;
  padding: 20px;
`;

const NewChatButton = styled.button`
  margin: 10px 0;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

export default ChatComponent;
