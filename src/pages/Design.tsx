import React from 'react';
import DesignPage from '../components/DesignPage';
import { Message } from '../types/Message';

interface DesignProps {
  chatroomId:number;
  category: string;
  handleSaveToSidebar: (title: string) => Promise<void>;
  questionTitles: { chatroomId: number; title: string; category: string }[];
  questions: Message[];
  fetchQuestionTitles: (categoryType: string) => Promise<void>;
  onNewMessage: (messages: Message[]) => Promise<void>;
}

const Design: React.FC<DesignProps> = (props) => {
  return <DesignPage {...props} />;
};

export default Design;
