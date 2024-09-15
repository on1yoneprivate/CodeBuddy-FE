import React from 'react';
import Test from '../components/Test';
import { Message } from '../types/Message';

interface TestProps {
  chatroomId: number;
  category: string;
  handleSaveToSidebar: (title: string) => Promise<void>;
  questionTitles: { chatroomId: number; title: string; category: string }[];
  questions: Message[];
  fetchQuestionTitles: (categoryType: string) => Promise<void>;
  onNewMessage: (messages: Message[]) => Promise<void>;
}

const TestPage: React.FC<TestProps> = (props) => {
  return <Test {...props} />;
};

export default TestPage;