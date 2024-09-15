import React from 'react';
import Code from '../components/Code';
import { Message } from '../types/Message';

interface CodeProps {
  chatroomId: number;
  category: string;
  handleSaveToSidebar: (title: string) => Promise<void>;
  questionTitles: { chatroomId: number; title: string; category: string }[];
  questions: Message[];
  fetchQuestionTitles: (categoryType: string) => Promise<void>;
  onNewMessage: (messages: Message[]) => Promise<void>;
}

const CodePage: React.FC<CodeProps> = (props) => {
  return <Code {...props} />;
};

export default CodePage;