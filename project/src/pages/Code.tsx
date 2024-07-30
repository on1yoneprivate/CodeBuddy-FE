import React from 'react';
import CodePage from '../components/CodePage';
import { Message } from '../types/Message';

interface CodeProps {
  chatroomId: string;
  category: string;
  handleSaveToSidebar: (title: string) => Promise<void>;
  questionTitles: { chatroomId: string; title: string; category: string }[];
  questions: Message[];
  fetchQuestionTitles: (categoryType: string) => Promise<void>;
  onNewMessage: (messages: Message[]) => Promise<void>;
}

const Code: React.FC<CodeProps> = (props) => {
  return <CodePage {...props} />;
};

export default Code;
