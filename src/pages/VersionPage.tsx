import React from 'react';
import Version from '../components/Version';
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

const VersionPage: React.FC<VersionProps> = (props) => {
  return <Version {...props} />;
};

export default VersionPage;
