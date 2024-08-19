import React, { useEffect, useState } from 'react';
import './App.css';
import { useLocation, useNavigate } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { jwtDecode } from 'jwt-decode';
import { ChatroomProvider } from './context/ChatroomContext';

interface JwtPayload {
  exp: number; // 만료 시간을 나타내는 클레임
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [questionTitles, setQuestionTitles] = useState<string[]>([]);
  const [chatroomId, setChatroomId] = useState<number>(1); // chatroomId를 1로 초기화


  useEffect(() => {
    const pathsWithoutAuthCheck = ['/init', '/login', '/signup'];

    // 현재 경로가 인증이 필요 없는 경로라면 토큰 검사를 하지 않음
    if (pathsWithoutAuthCheck.includes(location.pathname)) {
      return;
    }

    const accessToken = localStorage.getItem('accessToken');
    
    if (accessToken) {
      // 토큰 만료 여부 확인
      const isTokenExpired = () => {
        try {
          const decodedToken = jwtDecode<JwtPayload>(accessToken);
          const currentTime = Date.now() / 1000; // 현재 시간 (초 단위)
          
          return decodedToken.exp < currentTime;
        } catch (error) {
          console.error("Failed to decode token", error);
          return true;
        }
      };

      if (isTokenExpired()) {
        // 토큰이 만료된 경우
        localStorage.removeItem('accessToken'); // 만료된 토큰 제거
        setIsAuthenticated(false);
        navigate('/init'); // Init 화면으로 리다이렉트
      } else {
        setIsAuthenticated(true);
      }
    } else {
      setIsAuthenticated(false);
      navigate('/init'); // 토큰이 없는 경우 Init 화면으로 리다이렉트
    }
  }, [location.pathname, navigate]);

  const handleResponse = async (input: string): Promise<void> => {
    const newTitle = input.trim().substring(0, 10);
    setQuestionTitles((prevTitles) => [...prevTitles, newTitle]);
    setChatroomId((prevId) => prevId + 1); // chatroomId 증가
  };

  const handleSaveToSidebar = async (title: string): Promise<void> => {
    setQuestionTitles((prevTitles) => [...prevTitles, title]);
    setChatroomId((prevId) => prevId + 1); // chatroomId 증가
  };


  return (
    <div className="app">
      <ChatroomProvider>
        <AppRoutes
          chatroomId={chatroomId}
          setChatroomId={setChatroomId}
          handleResponse={handleResponse} 
          handleSaveToSidebar={handleSaveToSidebar}
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated} />
      </ChatroomProvider>
    </div>
  );
};

export default App;