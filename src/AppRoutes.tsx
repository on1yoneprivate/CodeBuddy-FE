import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Message } from './types/Message';
import Login from './pages/Login/Login';
import SignUp from './pages/Signup/SignUp';
import Home from './pages/Home/Home';
import PlanPage from './pages/PlanPage';
import Init from './components/Init';
import { fetchWithToken } from './api/fetchWithToken';
import apiClient from './api/apiClient';


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
    const pathsWithoutAuthCheck = ['/', '/login', '/signup', '/init'];
  
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
  
    // 인증이 필요하지 않은 경로에서 토큰 확인을 건너뜀
    if (pathsWithoutAuthCheck.includes(location.pathname)) {
      setLoading(false);  // 로딩 상태를 false로 설정
    } else {
      checkAuth();  // 인증이 필요한 경우에만 토큰 확인 실행
    }
  }, [location.pathname, setIsAuthenticated]);
  
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated && !['/', '/login', '/signup', '/init'].includes(location.pathname)) {
        navigate('/');  // 로그인이 필요하지만 인증되지 않은 상태로 접근한 경우
      } else if (isAuthenticated && (location.pathname === '/' || location.pathname === '/init')) {
        navigate('/home');  // 이미 로그인한 상태에서 init이나 루트에 있을 경우 home으로 리다이렉트
      }
    }
  }, [loading, isAuthenticated, location.pathname, navigate]);

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

  const handleNewMessage = async (message: Message[], categoryType: string) => {
    try {
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
          category: categoryType, // 동적으로 설정된 카테고리
        };

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

  const handleSaveToSidebar = async (title: string, categoryType: string): Promise<void> => {
    const newTitle = {
      chatroomId: chatroomId + 1, // 새로운 chatroomId를 설정
      title: title,
      category: categoryType, // 동적으로 설정된 카테고리
    };
    setQuestionTitles((prevTitles) => [...prevTitles, newTitle]);
    setChatroomId((prevId) => prevId + 1); // chatroomId 증가
  };

  return (
    <div>
      <div style={{ marginLeft: 200 }}>
        <Routes>
          <Route path="/" element={<Init />} />
          <Route path="/init" element={<Init />} />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/home" element={<Home />} />
          <Route path="/plan" element={isAuthenticated ? 
            <PlanPage
              chatroomId={chatroomId}
              onNewMessage={(messages) => handleNewMessage(messages, 'plan')}
              handleSaveToSidebar={(title) => handleSaveToSidebar(title, 'plan')} 
              questionTitles={sidebarData} 
              questions={planQuestions} 
              fetchQuestionTitles={fetchQuestionTitles}
              category="plan" 
            /> : <Init />} />
        </Routes>
      </div>
    </div>
  );
};

export default AppRoutes;
