import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from '../pages/Home/Home';
import Plan from "../pages/Plan";
import { Message } from "../types/Message";
import Design from "../pages/Design";
import Code from "../pages/Code";

interface RouterProps {
  handleResponse: (input: string) => Promise<void>;
  handleSaveToSidebar: (title: string) => Promise<void>;
  questionTitles: { chatroomId: number; title: string; category: string }[];
  questions: Message[];
  fetchQuestionTitles: (categoryType: string) => Promise<void>;
  onNewMessage: (message: Message[]) => Promise<void>;
  chatroomId: number;
}

const Router: React.FC<RouterProps> = ( router: RouterProps ) => {
  const { onNewMessage, handleSaveToSidebar, questionTitles, questions, fetchQuestionTitles, chatroomId} = router;
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route 
          path="/plan" 
          element={
            <Plan 
              chatroomId={chatroomId}
              onNewMessage={onNewMessage} 
              handleSaveToSidebar={handleSaveToSidebar} 
              questionTitles={questionTitles} 
              questions={questions}
              fetchQuestionTitles={fetchQuestionTitles}
              category="plan"
            />
          } 
        />
        <Route 
          path="/design" 
          element={
            <Design 
              chatroomId={chatroomId}
              onNewMessage={onNewMessage} 
              handleSaveToSidebar={handleSaveToSidebar} 
              questionTitles={questionTitles} 
              questions={questions}
              fetchQuestionTitles={fetchQuestionTitles}
              category="design"
            />
          } 
        />
        <Route 
          path="/code" 
          element={
            <Code 
              chatroomId={chatroomId}
              onNewMessage={onNewMessage}
              handleSaveToSidebar={handleSaveToSidebar} 
              questionTitles={questionTitles} 
              questions={questions}
              fetchQuestionTitles={fetchQuestionTitles}
              category="code"
            />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;