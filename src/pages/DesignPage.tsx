import React from 'react';
import Design from '../components/Design';
import { Message } from '../types/Message';

interface DesignProps {
  chatroomId: number;
  category: string;
  handleSaveToSidebar: (title: string) => Promise<void>;
  questionTitles: { chatroomId: number; title: string; category: string }[];
  questions: Message[];
  fetchQuestionTitles: (categoryType: string) => Promise<void>;
  onNewMessage: (messages: Message[]) => Promise<void>;
}

const DesignPage: React.FC<DesignProps> = (props) => {
  return <Design {...props} />;
};

export default DesignPage;