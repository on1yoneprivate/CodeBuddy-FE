import React, { useEffect, useState } from 'react';
import ChatInterface from '../components/ChatInterface';
import styled from 'styled-components';
import AnswerArea from '../components/AnswerArea';
import Sidebar from '../components/Sidebar';
import { Message } from '../types/Message';
import { fetchWithToken } from '../api/fetchWithToken';

const PlanPageContainer = styled.div`
  display: flex;
`;

const MainContent = styled.div`
  flex-grow: 1;
  padding: 20px;
  margin-left: 200px; /* Adjusted to accommodate the sidebar width */
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
  width: 200px; /* Sidebar width */
  background-color: #f0f0f0;
  border-right: 1px solid #ddd;
  padding: 20px; /* Optional: to add some padding inside the sidebar */
`;

interface PlanProps {
  handleSaveToSidebar: (title: string) => Promise<void>;
  questionTitles: { chatroomId: number; title: string; category: string }[];
  questions: Message[];
  fetchQuestionTitles: (categoryType: string) => Promise<void>;
  onNewMessage: (message: Message[]) => Promise<void>;
  category: string;
}

const PlanPage: React.FC<PlanProps> = ({ questionTitles, questions: initialQuestions, fetchQuestionTitles, category }) => {
  const [questions, setQuestions] = useState<Message[]>(initialQuestions);
  const [currentChatroomId, setCurrentChatroomId] = useState<number | null>(null); // 현재 선택된 채팅방 ID
  const [sidebarData, setSidebarData] = useState<{ chatroomId: number; title: string; category: string }[]>(questionTitles); // 사이드바에 표시할 데이터

  const [chatroomCounter, setChatroomCounter] = useState<number>(0); // 모든 카테고리에서 공통으로 사용하는 chatroomId

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
          chatroomId: parseInt(q.content, 10) || 'No content',
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
    try {
      const storedData = localStorage.getItem(`chatroom-${chatroomId}`);
      if (storedData) {
        const { questions } = JSON.parse(storedData);
        setQuestions(questions);
        console.log('채팅방 데이터를 로컬 스토리지에서 불러오기 성공');
      } else {
        // API에서 데이터 가져오기
        const response = await fetchWithToken(`/chats/${chatroomId}?loginId=${localStorage.getItem('loginId')}`, {
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
    if (currentChatroomId === null) {
      console.error('No chatroom ID available for saving.');
      return;
    }
    const newSidebarItem = { chatroomId: currentChatroomId, title, category };

    setSidebarData(prevSidebarData => [...prevSidebarData, newSidebarItem]);
    localStorage.setItem(`chatroom-${currentChatroomId}`, JSON.stringify({ questions }));
    console.log('사이드바에 데이터 나타내기 성공', `chatroomId: ${currentChatroomId}`);
  };

  const handleSave = async (chatroomId: number) => {
    setQuestions(prevQuestions => {
      const newQuestions = prevQuestions.map(q =>
        q.chatroomId === chatroomId ? { ...q, saved: true } : q
      );
      localStorage.setItem(`chatroom-${chatroomId}`, JSON.stringify({ questions: newQuestions }));
      return newQuestions;
    });
    console.log('Data saved.', `chatroomId: ${chatroomId}`);
  };

  const handleNewMessage = async (message: Message[]) => {
    if (category === null) {
      console.error('No category available for sending a message.');
      return;
    }
  
    const newChatroomId = chatroomCounter + 1;
    setChatroomCounter(newChatroomId);
  
    try {
      const apiUrl = `/main/ask/${newChatroomId}?categoryType=${category.toUpperCase()}`;
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
        // 응답 데이터를 개별 줄로 분리
        const responseLines = responseText.split('\n').filter(line => line.trim() !== '');
        const responseData = responseLines
        .filter(line => line.startsWith('data:')) // "data:"로 시작하는 줄만 처리
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
  
        // JSON 응답 데이터를 처리하여 조각들을 병합
        const responseMessageContent = responseData.map((item: { content: string }) => item.content).join('');
        const responseMessage: Message = {
          chatroomId: newChatroomId,
          type: 'text',
          input: message[0].input,
          output: responseMessageContent,
        };
        setQuestions(prevQuestions => [...prevQuestions, responseMessage]);
  
        const newSidebarItem = {
          chatroomId: newChatroomId,
          title: message[0].input.substring(0, 10),
          category,
        };
  
        setSidebarData(prevSidebarData => [...prevSidebarData, newSidebarItem]);
        localStorage.setItem(`chatroom-${newChatroomId}`, JSON.stringify({ questions: [...questions, responseMessage] }));
  
        console.log('질문에 대한 응답을 받았습니다.', responseMessage);
        console.log('새로운 입력값이 추가되었습니다: ', newSidebarItem);
      } catch (parseError) {
        console.error('JSON Parse error:', parseError, 'Response Text:', responseText);
      }
    } catch (error) {
      console.error('Error generating response:', error);
    }
  };

  return (
    <PlanPageContainer>
      <StyledSidebar
        questionTitles={sidebarData}
        onItemClick={(id: number, category: string) => handleSidebarClick(id, category)}
      />
      <MainContent>
        {currentChatroomId !== null ? (
          <>
            <ChatInterface
              chatroomId={currentChatroomId}
              onNewMessage={handleNewMessage}
              category={category}
            />
            <AnswerArea messages={questions} onSave={() => handleSave(currentChatroomId)} />
          </>
        ) : (
          <>
            <ChatInterface
              chatroomId={0}
              onNewMessage={handleNewMessage}
              category={category}
            />
            <AnswerArea messages={questions} onSave={() => console.log('No chatroom to save')} />
          </>
        )}
      </MainContent>
    </PlanPageContainer>
  );
};

export default PlanPage;
