import React from 'react';
import VersionPage from '../components/VersionPage';
import { Message } from '../types/Message';

interface VersionProps {
  chatroomId: number;
  category: string;
  handleSaveToSidebar: (title: string) => Promise<void>;
  questionTitles: { chatroomId: number; title: string; category: string }[];
  questions: Message[];
  fetchQuestionTitles: (categoryType: string) => Promise<void>;
  onNewMessage: (messages: Message[]) => Promise<void>;
}

const Version: React.FC<VersionProps> = (props) => {
  return <VersionPage {...props} />;
};

export default Version;
