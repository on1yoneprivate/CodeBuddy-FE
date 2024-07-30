import React from 'react';
import PlanPage from '../components/PlanPage';
import { Message } from '../types/Message';

interface PlanProps {
  chatroomId: string;
  category: string;
  handleSaveToSidebar: (title: string) => Promise<void>;
  questionTitles: { chatroomId: string; title: string; category: string }[];
  questions: Message[];
  fetchQuestionTitles: (categoryType: string) => Promise<void>;
  onNewMessage: (messages: Message[]) => Promise<void>;
}

const Plan: React.FC<PlanProps> = (props) => {
  return <PlanPage {...props} />;
};

export default Plan;
