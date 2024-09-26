import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from '../components/NewSidebar'; // Sidebar 컴포넌트 가져오기
import ProjectPage from '../pages/ProjectPage'; // 각 프로젝트 화면

const App = () => {
  const questionTitles = [
    { chatroomId: 2, title: "프로젝트 2", category: "project" },
    { chatroomId: 3, title: "프로젝트 3", category: "project" },
  ];

  const handleItemClick = (chatroomId: number, category: string) => {
    console.log(`Item clicked: ${chatroomId}, Category: ${category}`);
  };

  const handleDeleteClick = (chatroomId: number) => {
    console.log(`Delete clicked: ${chatroomId}`);
  };

  return (
    <Router>
      <Sidebar
        questionTitles={questionTitles}
        onItemClick={handleItemClick}
        onDeleteClick={handleDeleteClick}
      />
    </Router>
  );
};

export default App;