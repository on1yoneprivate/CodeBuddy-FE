import React, { useState } from 'react';
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';


const App: React.FC = () => {
  const [questionTitles, setQuestionTitles] = useState<string[]>([]);

  const handleResponse = async (input: string) => {
    const newTitle = input.trim().substring(0, 10);
    setQuestionTitles((prevTitles) => [...prevTitles, newTitle]);
  };

  const handleSaveToSidebar = async (title: string): Promise<void> => {
    setQuestionTitles((prevTitles) => [...prevTitles, title]);
  };

  const chatroomId = Date.now().toString();

  return (
    <div className="app">
      <BrowserRouter>
        <AppRoutes
          chatroomId={chatroomId}
          handleResponse={handleResponse} 
          handleSaveToSidebar={handleSaveToSidebar} />
      </BrowserRouter>
    </div>
  );
};

export default App;
