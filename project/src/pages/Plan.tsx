import React, { useState, ReactElement } from 'react';
import ChatInterface from '../components/ChatInterface';
import styled from 'styled-components';
import DisplayArea from '../components/DisplayArea';
import AnswerArea from '../components/AnswerArea';
import Sidebar from '../components/\bSidebar2';

const PlanPageContainer = styled.div`
  display: flex;
`;

const MainContent = styled.div`
  flex-grow: 1;
  padding: 20px;
  margin-left: 200px; /* Sidebar width */
  display: flex;
  flex-direction: column;
  align-items: center; /* Center the content horizontally */
  justify-content: center; /* Center the content vertically */
`;

const PlanPage: React.FC = (): ReactElement => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [lastQuestionTitle, setLastQuestionTitle] = useState<string>('');

  const handleResponse = (input: string) => {
    setQuestions(prevQuestions => [...prevQuestions, input]);
    setLastQuestionTitle(input.trim().substring(0, 10));
  };

  return (
    <PlanPageContainer>
      <Sidebar questionTitle={lastQuestionTitle} />
      <MainContent>
        <ChatInterface handleResponse={handleResponse} />
        <DisplayArea messages={questions} />
        <AnswerArea messages={questions} />
      </MainContent>
    </PlanPageContainer>
  );
};

export default PlanPage;
