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
import Init from './pages/Init/init';

interface AppRoutesProps {
  handleResponse: (input: string) => Promise<void>;
  handleSaveToSidebar: (title: string) => Promise<void>;
  chatroomId: string;
}

interface SavedQuestion {
  chatroomId: string;
  loginId: string;
  categoryType: string;
  historyPrompt: string;
  historyOutput: string;
}

interface SidebarData {
  chatroomId: string;
  title: string;
  category: string;
}

const AppRoutes: React.FC<AppRoutesProps> = ({ handleResponse, handleSaveToSidebar, chatroomId }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Message[]>([]);
  const [planQuestions, setPlanQuestions] = useState<Message[]>([]);
  const [designQuestions, setDesignQuestions] = useState<Message[]>([]);
  const [codeQuestions, setCodeQuestions] = useState<Message[]>([]);
  const [testcodeQuestions, setTestcodeQuestions] = useState<Message[]>([]);
  const [versionQuestions, setVersionQuestions] = useState<Message[]>([]);
  const [questionTitles, setQuestionTitles] = useState<{ chatroomId: string; title: string; category: string }[]>([]);
  const [savedQuestions, setSavedQuestions] = useState<SavedQuestion[]>([]);
  const [sidebarData, setSidebarData] = useState<SidebarData[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('loginId');
      if (token && userId) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setIsAuthenticated(true);
        await fetchQuestionTitles(location.pathname.substring(1));
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    checkAuth();
  }, [location.pathname]);

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
          chatroomId: id,
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
      navigate('/');
    }
  }, [loading, isAuthenticated, location, navigate]);

  const handleSidebarClick = async (chatroomId: string, category: string) => {
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

  const handleNewMessage = async (messages: Message[], categoryType: string) => {
    const loginId = localStorage.getItem('loginId');
    const chatroomId = `${Date.now()}`;

    try {
      const response = await apiClient.post(`/main/ask/${chatroomId}/${categoryType.toUpperCase()}`, { loginId, input: messages[0].input });
      const responseMessage: Message = { chatroomId, type: 'text', input: messages[0].input, output: response.data.output };
      const updatedQuestions = [...questions, ...messages, responseMessage];
      setQuestions(updatedQuestions);

      if (categoryType === 'plan') {
        setPlanQuestions(updatedQuestions);
      } else if (categoryType === 'design') {
        setDesignQuestions(updatedQuestions);
      } else if (categoryType === 'code') {
        setCodeQuestions(updatedQuestions);
      } else if (categoryType === 'testcode') {
        setCodeQuestions(updatedQuestions);
      }

      const newSavedQuestion: SavedQuestion = {
        chatroomId,
        loginId: loginId as string,
        categoryType,
        historyPrompt: messages[0].input,
        historyOutput: responseMessage.output,
      };
      setSavedQuestions(prevSaved => {
        const updatedSaved = [...prevSaved, newSavedQuestion];
        localStorage.setItem('chatHistory', JSON.stringify(updatedSaved));
        console.log('Saved to localStorage: ', updatedSaved);

        return updatedSaved;
      });

      const newSidebarItem: SidebarData = {
        chatroomId,
        title: messages[0].input,
        category: categoryType
      };
      setSidebarData(prevSidebarData => {
        const updatedSidebarData = [...prevSidebarData, newSidebarItem];
        localStorage.setItem('sidebarData', JSON.stringify(updatedSidebarData));
        return updatedSidebarData;
      });

      await apiClient.put(`/save/${chatroomId}`, {
        loginId,
        categoryType,
        newSavedQuestion
      });

      console.log('질문 저장 성공');

    } catch (error) {
      console.error('Error submitting input:', error);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Sidebar 
        questionTitles={sidebarData} 
        onItemClick={handleSidebarClick} 
      />
      <div style={{ marginLeft: 200 }}>
        <Routes>
          <Route path="/" element={<Init />} />
          <Route path="/home" element={isAuthenticated ? <Home /> : <Init />} />
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
              handleFetchChatroom={handleFetchChatroom}
            /> : <Init />} />
          <Route path="/login" element={<Login />} />
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
