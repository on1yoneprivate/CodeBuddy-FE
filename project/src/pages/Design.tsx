import React from 'react';
import DesignPage from '../components/DesignPage';
import { Message } from '../types/Message';

interface DesignProps {
  chatroomId: string;
  handleSaveToSidebar: (title: string) => Promise<void>;
  questionTitles: { chatroomId: string; title: string; category: string }[];
  questions: Message[];
  fetchQuestionTitles: (categoryType: string) => Promise<void>;
  onNewMessage: (messages: Message[]) => Promise<void>;
  handleFetchChatroom: (id: string, category: string) => Promise<void>; // Add this line
  category : string;
}

const Design: React.FC<DesignProps> = (props) => {
  return <DesignPage {...props} />;
};

export default Design;
