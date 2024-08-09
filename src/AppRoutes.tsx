import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Message } from './types/Message';
import apiClient from './api/apiClient';
import Sidebar from './components/Sidebar';
import Testcode from './pages/Testcode';
import Plan from './pages/Plan';
import Code from './pages/Code';
import Design from './pages/Design';
import Mypage from './pages/Mypage';
import Version from './pages/Version';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import Init from './pages/Init/Init';
import { fetchWithToken } from './api/fetchWithToken';

interface AppRoutesProps {
  handleResponse: (input: string) => Promise<void>;
  handleSaveToSidebar: (title: string) => Promise<void>;
  chatroomId: number;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setChatroomId: React.Dispatch<React.SetStateAction<number>>;
}

interface SavedQuestion {
  chatroomId: number;
  loginId: string;
  categoryType: string;
  historyPrompt: string;
  historyOutput: string;
}

interface SidebarData {
  chatroomId: number;
  title: string;
  category: string;
}

const AppRoutes: React.FC<AppRoutesProps> = ({ chatroomId, setChatroomId, isAuthenticated, setIsAuthenticated }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Message[]>([]);
  const [planQuestions, setPlanQuestions] = useState<Message[]>([]);
  const [designQuestions, setDesignQuestions] = useState<Message[]>([]);
  const [codeQuestions, setCodeQuestions] = useState<Message[]>([]);
  const [testcodeQuestions, setTestcodeQuestions] = useState<Message[]>([]);
  const [versionQuestions, setVersionQuestions] = useState<Message[]>([]);
  const [questionTitles, setQuestionTitles] = useState<{ chatroomId: number; title: string; category: string }[]>([]);
  const [savedQuestions, setSavedQuestions] = useState<SavedQuestion[]>([]);
  const [sidebarData, setSidebarData] = useState<SidebarData[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    checkAuth();
  }, [location.pathname, setIsAuthenticated]);

  useEffect(() => {
    if (!loading && !isAuthenticated && location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/signup') {
      navigate('/');
    }
  }, [loading, isAuthenticated, location, navigate]);

  useEffect(() => {
    const storedData: SavedQuestion[] = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    setSavedQuestions(storedData);
  }, []);

  const fetchQuestionTitles = async (categoryType: string) => {
    try {
      const userId = localStorage.getItem('loginId');
      const response = await apiClient.get('/chatrooms/titles', {
        params: { userId, categoryType }
      });
      if (response.data.success) {
        const titles = Object.entries(response.data.data).map(([id, title]) => ({
          chatroomId: parseInt(id, 10),
          title: title as string,
          category: categoryType
        }));
        setQuestionTitles(titles);
        setSidebarData(titles);
      }
    } catch (error) {
      console.error('채팅방 제목을 불러오는 데 실패했습니다.', error);
    }
  };

  useEffect(() => {
    if (!loading && !isAuthenticated && location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/signup') {
      navigate('/init');
    }
  }, [loading, isAuthenticated, location, navigate]);

  const handleSidebarClick = async (chatroomId: number, category: string) => {
    try {
      const response = await apiClient.get(`/chatrooms/${chatroomId}`, {
        params: { userId: localStorage.getItem('loginId') }
      });
      if (response.data.success) {
        const { questions } = response.data.data;
        setQuestions(questions);
        navigate(`/${category}`);
      }
    } catch (error) {
      console.error('채팅방 데이터를 불러오는 데 실패했습니다.', error);
    }
  };

  const getCategoryFromPath = (path: string): string => {
    const segments = path.split('/');
    return segments[1]; // Assuming the category is the first segment after the leading slash
  };

  const category = getCategoryFromPath(location.pathname);

  const handleResponse = async (input: string) => {
    const newTitle = {
      chatroomId: chatroomId + 1, // 새로운 chatroomId를 설정
      title: input.trim().substring(0, 10),
      category: category, // 동적으로 설정된 카테고리
    };
    setQuestionTitles((prevTitles) => [...prevTitles, newTitle]);
    setChatroomId((prevId) => prevId + 1); // chatroomId 증가
  };

  const handleSaveToSidebar = async (title: string): Promise<void> => {
    const newTitle = {
      chatroomId: chatroomId + 1, // 새로운 chatroomId를 설정
      title: title,
      category: category, // 동적으로 설정된 카테고리
    };
    setQuestionTitles((prevTitles) => [...prevTitles, newTitle]);
    setChatroomId((prevId) => prevId + 1); // chatroomId 증가
  };

  const handleNewMessage = async (message: Message[], categoryType: string) => {
    try {
      // API 사용
      const apiUrl = `/main/ask/${chatroomId}?categoryType=${categoryType.toUpperCase()}`;
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
          category: category, // 동적으로 설정된 카테고리
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

  const handleFetchChatroom = async (chatroomId: string, category: string) => {
    try {
      const userId = localStorage.getItem('loginId');
      const response = await apiClient.get(`/chatrooms/${chatroomId}`, {
        params: { userId }
      });
      if (response.data.success) {
        const { questions } = response.data.data;
        setQuestions(questions);
        
        if (category === 'plan') {
          setPlanQuestions(questions);
        } else if (category === 'design') {
          setDesignQuestions(questions);
        } else if (category === 'code') {
          setCodeQuestions(questions);
        }
      }
    } catch (error) {
      console.error('채팅방 데이터를 불러오는 데 실패했습니다.', error);
    }
  };

  useEffect(() => {
    const storedSidebarData: SidebarData[] = JSON.parse(localStorage.getItem('sidebarData') || '[]');
    setSidebarData(storedSidebarData);
  }, []);

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
    <div>
      <Sidebar 
        questionTitles={sidebarData} 
        onItemClick={handleSidebarClick}
        onDeleteClick={handleDeleteClick}
      />
      <div style={{ marginLeft: 200 }}>
        <Routes>
          <Route path="/init" element={<Init />} />
          <Route path="/home" element={isAuthenticated ? <Home /> : <Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/plan" element={isAuthenticated ? 
            <Plan
              chatroomId={chatroomId}
              onNewMessage={(messages) => handleNewMessage(messages, 'plan')}
              handleSaveToSidebar={handleSaveToSidebar} 
              questionTitles={sidebarData} 
              questions={planQuestions} 
              fetchQuestionTitles={fetchQuestionTitles}
              category="plan" 
            /> : <Init />} />
          <Route path="/code" element={isAuthenticated ? 
            <Code 
              chatroomId={chatroomId}
              onNewMessage={(messages) => handleNewMessage(messages, 'code')}
              handleSaveToSidebar={handleSaveToSidebar}
              questionTitles={questionTitles}
              questions={codeQuestions}
              fetchQuestionTitles={fetchQuestionTitles}
              category="code"
            /> : <Init />} />
          <Route path="/design" element={isAuthenticated ? 
            <Design 
              chatroomId={chatroomId}
              onNewMessage={(messages) => handleNewMessage(messages, 'design')}
              handleSaveToSidebar={handleSaveToSidebar}
              questionTitles={questionTitles}
              questions={designQuestions}
              fetchQuestionTitles={fetchQuestionTitles}
              category="design"
            /> : <Init />} />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/mypage" element={isAuthenticated ? <Mypage /> : <Init />} />
          <Route path="/testcode" element={isAuthenticated ? 
            <Testcode 
              chatroomId={chatroomId}
              onNewMessage={(messages) => handleNewMessage(messages, 'testcode')}
              handleSaveToSidebar={handleSaveToSidebar} 
              questionTitles={sidebarData} 
              questions={testcodeQuestions} 
              fetchQuestionTitles={fetchQuestionTitles}
              category="testcode" 
            /> : <Init />} />
          <Route path="/version" element={isAuthenticated ? 
            <Version 
              chatroomId={chatroomId}
              onNewMessage={(messages) => handleNewMessage(messages, 'version')}
              handleSaveToSidebar={handleSaveToSidebar} 
              questionTitles={sidebarData} 
              questions={testcodeQuestions} 
              fetchQuestionTitles={fetchQuestionTitles}
              category="version" 
            /> : <Init />} />
        </Routes>
      </div>
    </div>
  );
};

export default AppRoutes;
