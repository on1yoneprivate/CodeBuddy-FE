import { Message } from './Message';

export interface QuestionTitle {
  chatroomId: number;
  title: string;
  category: string;
}

export interface ChatroomProps {
  handleSaveToSidebar: (title: string) => Promise<void>;
  questionTitles: QuestionTitle[];
  questions: Message[];
  fetchQuestionTitles: (categoryType: string) => Promise<void>;
  onNewMessage: (message: Message[]) => Promise<void>;
  category: string;
}