import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';

const App: React.FC = () => {
  const [questionTitles, setQuestionTitles] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [chatroomId, setChatroomId] = useState<number>(1); // chatroomId를 1로 초기화

  // useEffect 훅을 사용하여 컴포넌트가 마운트될 때 인증 상태를 확인합니다.
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      setIsAuthenticated(true);
    }
  }, []);
  
  const handleResponse = async (input: string) => {
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
      <BrowserRouter>
        <AppRoutes
          chatroomId={chatroomId}
          setChatroomId={setChatroomId}
          handleResponse={handleResponse} 
          handleSaveToSidebar={handleSaveToSidebar}
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated} />
      </BrowserRouter>
    </div>
  );
};

export default App;