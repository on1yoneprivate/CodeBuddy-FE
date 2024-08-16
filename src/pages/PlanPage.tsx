import React from 'react';
import Plan from '../components/Plan';
import { Message } from '../types/Message';

interface PlanProps {
  chatroomId: number;
  category: string;
  handleSaveToSidebar: (title: string) => Promise<void>;
  questionTitles: { chatroomId: number; title: string; category: string }[];
  questions: Message[];
  fetchQuestionTitles: (categoryType: string) => Promise<void>;
  onNewMessage: (messages: Message[]) => Promise<void>;
}

const PlanPage: React.FC<PlanProps> = (props) => {
  return <Plan {...props} />;
};

export default PlanPage;