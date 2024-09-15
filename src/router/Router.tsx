import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from '../components/Home';
import { Message } from "../types/Message";
import Plan from "../pages/PlanPage";
import Design from "../pages/DesignPage";
import Code from "../pages/CodePage";
import Test from "../pages/TestPage";
import Version from "../pages/VersionPage"
import Init from "../components/Init";

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
        {/* <Route path="/init" element={<Init />} /> */}
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
        <Route 
          path="/testcode" 
          element={
            <Test 
              chatroomId={chatroomId}
              onNewMessage={onNewMessage}
              handleSaveToSidebar={handleSaveToSidebar} 
              questionTitles={questionTitles} 
              questions={questions}
              fetchQuestionTitles={fetchQuestionTitles}
              category="test"
            />
          } 
        />
        <Route 
          path="/version" 
          element={
            <Test 
              chatroomId={chatroomId}
              onNewMessage={onNewMessage}
              handleSaveToSidebar={handleSaveToSidebar} 
              questionTitles={questionTitles} 
              questions={questions}
              fetchQuestionTitles={fetchQuestionTitles}
              category="deploy"
            />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;