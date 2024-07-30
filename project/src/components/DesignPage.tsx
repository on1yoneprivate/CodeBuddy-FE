import React, { useEffect, useState } from 'react';
import ChatInterface from '../components/ChatInterface';
import styled from 'styled-components';
import AnswerArea from '../components/AnswerArea';
import Sidebar from '../components/Sidebar';
import { Message } from '../types/Message';
import apiClient from '../api/apiClient';

const DesignPageContainer = styled.div`
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

interface DesignProps {
  handleSaveToSidebar: (title: string) => Promise<void>;
  questionTitles: { chatroomId: string; title: string; category: string }[];
  questions: Message[];
  fetchQuestionTitles: (categoryType: string) => Promise<void>;
  onNewMessage: (message: Message[]) => Promise<void>;
  category: string;
  chatroomId: string;
}

const DesignPage: React.FC<DesignProps> = ({ questionTitles, questions: initialQuestions, fetchQuestionTitles, category, chatroomId }) => {
  const [questions, setQuestions] = useState<Message[]>([]);
  const [currentChatroomId, setCurrentChatroomId] = useState<string | null>(null); // 현재 선택된 채팅방 ID
  const [sidebarData, setSidebarData] = useState<{ chatroomId: string; title: string; category: string }[]>([]); // 사이드바에 표시할 데이터

  useEffect(() => {
    const storedLoginId = localStorage.getItem('loginId');
    if (storedLoginId) {
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
        apiClient.get('/chatrooms/titles', { params: { userId, categoryType } }),
        apiClient.get('/main/design/saved', { params: { userId } }),
      ]);

      if (chatroomResponse.data.success) {
        setSidebarData(Object.entries(chatroomResponse.data.data).map(([chatroomId, title]: [string, any]) => ({
          chatroomId,
          title,
          category: categoryType,
        })));
      }

      const { savedQuestions } = savedDataResponse.data;
      setSidebarData(prevData => [
        ...prevData,
        ...savedQuestions.map((q: { content: string }) => ({
          chatroomId: q.content || 'No content',
          title: (q.content || 'No content').trim().substring(0, 10),
          category: 'design',
        })),
      ]);
    } catch (error) {
      console.error('초기 데이터를 불러오는 데 실패했습니다.', error);
    }
  };

  const handleSidebarClick = async (chatroomId: string, category: string) => {
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
        const response = await apiClient.get(`/chats/${chatroomId}`, {
          params: { loginId: localStorage.getItem('loginId') },
        });
        if (response.data.success) {
          setQuestions(response.data.data.questions);
          localStorage.setItem(`chatroom-${chatroomId}`, JSON.stringify({ questions: response.data.data.questions }));
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
    if (!currentChatroomId) {
      console.error('No chatroom ID available for saving.');
      return;
    }
    const newSidebarItem = { chatroomId: currentChatroomId, title, category: 'design' };

    setSidebarData(prevSidebarData => [...prevSidebarData, newSidebarItem]);
    localStorage.setItem(`chatroom-${currentChatroomId}`, JSON.stringify({ questions }));
    console.log('사이드바에 데이터 나타내기 성공', `chatroomId: ${currentChatroomId}`);
  };

  const handleSave = (chatroomId: string) => {
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
    const newChatroomId = Date.now().toString();
    setCurrentChatroomId(newChatroomId);
    setQuestions(message);

    const newSidebarItem = {
      chatroomId: newChatroomId,
      title: message[0].input.substring(0, 10),
      category: 'design',
    };
    setSidebarData(prevSidebarData => [...prevSidebarData, newSidebarItem]);
    localStorage.setItem(`chatroom-${newChatroomId}`, JSON.stringify({ questions: message }));
    console.log('새로운 입력값이 추가되었습니다: ', newSidebarItem);
  };

  return (
    <DesignPageContainer>
      <StyledSidebar
        questionTitles={sidebarData}
        onItemClick={(id: string, category: string) => handleSidebarClick(id, category)}
      />
      <MainContent>
        {currentChatroomId ? (
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
              chatroomId=""
              onNewMessage={handleNewMessage}
              category={category}
            />
            <AnswerArea messages={questions} onSave={() => console.log('No chatroom to save')} />
          </>
        )}
      </MainContent>
    </DesignPageContainer>
  );
};

export default DesignPage;
