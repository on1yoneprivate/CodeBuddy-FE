import React, { useState } from 'react';
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';

const App: React.FC = () => {
  const [questionTitle, setQuestionTitle] = useState<string>('');

  const handleResponse = (input: string) => {
    setQuestionTitle(input.trim().substring(0, 10));
  };

  return (
    <div className="app">
      <BrowserRouter>
        <AppRoutes handleResponse={handleResponse} />
      </BrowserRouter>
    </div>
  );
};

export default App;
