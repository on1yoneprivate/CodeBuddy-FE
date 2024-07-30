import React from 'react';
import TestCodePage from '../components/TestCodePage';
import { Message } from '../types/Message';

interface TestCodeProps {
  chatroomId: string;
  category: string;
  handleSaveToSidebar: (title: string) => Promise<void>;
  questionTitles: { chatroomId: string; title: string; category: string }[];
  questions: Message[];
  fetchQuestionTitles: (categoryType: string) => Promise<void>;
  onNewMessage: (messages: Message[]) => Promise<void>;
}

const Testcode: React.FC<TestCodeProps> = (props) => {
  return <TestCodePage {...props} />;
};

export default Testcode;
