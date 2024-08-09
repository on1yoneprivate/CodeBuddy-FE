import React, { useEffect, useState } from 'react';
import ChatInterface from '../components/ChatInterface';
import styled from 'styled-components';
import AnswerArea from '../components/AnswerArea';
import Sidebar from '../components/Sidebar';
import { Message } from '../types/Message';
import { fetchWithToken } from '../api/fetchWithToken';

const TestCodePageContainer = styled.div`
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

interface TestcodeProps {
  handleSaveToSidebar: (title: string) => Promise<void>;
  questionTitles: { chatroomId: number; title: string; category: string }[];
  questions: Message[];
  fetchQuestionTitles: (categoryType: string) => Promise<void>;
  onNewMessage: (message: Message[]) => Promise<void>;
  category: string;
}

const TestCodePage: React.FC<TestcodeProps> = ({ questionTitles, questions: initialQuestions, fetchQuestionTitles, category }) => {
  const [questions, setQuestions] = useState<Message[]>([]);
  const [currentChatroomId, setCurrentChatroomId] = useState<number | null>(null); // 현재 선택된 채팅방 ID
  const [sidebarData, setSidebarData] = useState<{ chatroomId: number; title: string; category: string }[]>([]); // 사이드바에 표시할 데이터

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
        fetchWithToken(`/main/testcode/saved?userId=${userId}`, {
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
          category: 'testcode',
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
    const newSidebarItem = { chatroomId: currentChatroomId, title, category: 'testcode' };

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
    try {
      // API 사용
      const apiUrl = `/main/ask?categoryType=${category.toUpperCase()}`;
      const response = await fetchWithToken(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: message[0].input,
        }),
      });

      const responseData = await response.json();
      if (response.ok) {
        const responseMessage: Message = { chatroomId: responseData.chatroomId, type: 'text', input: message[0].input, output: responseData.output };
        setQuestions((prevQuestions) => [...prevQuestions, responseMessage]);

        const newSidebarItem = {
          chatroomId: responseData.chatroomId,
          title: message[0].input.substring(0, 10),
          category: 'testcode',
        };

        // localStorage 사용
        setSidebarData((prevSidebarData) => [...prevSidebarData, newSidebarItem]);
        localStorage.setItem(`chatroom-${responseData.chatroomId}`, JSON.stringify({ questions: message }));

        console.log('질문에 대한 응답을 받았습니다.', responseMessage);
        console.log('새로운 입력값이 추가되었습니다: ', newSidebarItem);
      } else {
        console.error('Error from server:', responseData);
      }
    } catch (error) {
      console.error('Error generating response:', error);
    }
  };

  const handleDeleteClick = async (chatroomId: number) => {
    try {
      const response = await fetchWithToken(`/delete/${chatroomId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      // 로컬 상태 및 로컬 스토리지에서 삭제 반영
      setSidebarData(prevSidebarData => prevSidebarData.filter(item => item.chatroomId !== chatroomId));
      localStorage.removeItem(`chatroom-${chatroomId}`);
      console.log('채팅방이 삭제되었습니다.', `chatroomId: ${chatroomId}`);
    } catch (error) {
      console.error('Error deleting chatroom:', error);
    }
  };

  return (
    <TestCodePageContainer>
      <StyledSidebar
        questionTitles={sidebarData}
        onItemClick={(id: number, category: string) => handleSidebarClick(id, category)}
        onDeleteClick={handleDeleteClick}
      />
      <MainContent>
        {currentChatroomId !== null ? (
          <>
            <ChatInterface
              chatroomId={currentChatroomId}
              onNewMessage={handleNewMessage}
              category={category}
              questions={questions}

            />
            <AnswerArea messages={questions} onSave={() => handleSave(currentChatroomId)} />
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
    </TestCodePageContainer>
  );
};

export default TestCodePage;
