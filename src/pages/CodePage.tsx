import { useNavigate, useParams } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import { useEffect, useState } from 'react';
import NewSidebar from '../components/NewSidebar';
import Spinner from '../components/Spinner';
import ProjectPopup from '../components/ProjectPopup';
import styled from 'styled-components';
import Dropdown from '../components/Dropdown';
import { LuFilePlus } from 'react-icons/lu';
import { QuestionTitle } from '../types/ChatroomProps';
import { Message } from '../types/Message';
import { useChatroom } from '../context/ChatroomContext';
import ChatInterface from '../components/ChatInterface';
import React from 'react';
import { fetchWithToken } from '../api/fetchWithToken';


const initialQuestions: Message[] = []; 
const initialQuestionTitles: QuestionTitle[] = [
  { chatroomId: 1, title: '프로젝트 1', category: 'plan' },
  { chatroomId: 2, title: '프로젝트 2', category: 'design' },
  { chatroomId: 3, title: '프로젝트 3', category: 'code' }
];


const CodePage = () => {
  const { chatroomId } = useParams<{ chatroomId: string }>();
  const [questions, setQuestions] = useState<Message[]>(initialQuestions);
  const [currentChatroomId, setCurrentChatroomId] = useState<number | null>(null);
  const [categoryChatroomIds, setCategoryChatroomIds] = useState<{ [key: string]: number }>({});
  const chatroomContext = useChatroom();
  const [isLoading, setIsLoading] = useState(false);
  const [questionTitles, setQuestionTitles] = useState<QuestionTitle[]>(initialQuestionTitles);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // State for selected category
  const navigate = useNavigate();
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 
  const [projects, setProjects] = useState<string[]>([]); // Example project list
  const { id } = useParams<{ id: string }>(); // URL에서 id 추출

  const options = [
    { label: '계획 설계', value: 'PLAN' },
    { label: '설계도 생성', value: 'design' },
    { label: '코드 생성', value: 'code' },
    { label: '회고', value: 'retrospect' },
  ];

  const [sidebarData, setSidebarData] = useState<QuestionTitle[]>(initialQuestionTitles);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    if (!chatroomId) {
      console.error('chatroomId가 설정되지 않았습니다.');
      return;
    }
  
    const fetchChatDetails = async () => {
      try {
        const response = await fetchWithToken(`/chats/${chatroomId}?categoryType=CODE`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch chat details');
        }
  
        const result = await response.json(); // 전체 응답 객체를 받아옵니다.
        console.log('서버에서 받아온 전체 데이터:', result);
  
        // result가 객체이고, 그 안의 data 필드가 배열인지 확인
        if (result && Array.isArray(result.data)) {
          const fetchedMessages: Message[] = result.data.map((message: { chatId: string, message: string }) => ({
            chatroomId: parseInt(chatroomId, 10), // 숫자로 변환한 chatroomId
            type: 'text', // 메시지 타입 설정
            input: message.message, // 서버에서 반환된 message를 input으로 사용
            output: message.message, // 서버에서 반환된 message를 output으로 사용
          }));
  
          setQuestions(fetchedMessages); // 상태 업데이트
        } else {
          console.error('data 필드가 배열이 아닙니다:', result.data);
        }
      } catch (error) {
        console.error('채팅 데이터를 불러오는 중 에러:', error);
      }
    };
  
    const savedSidebarData = localStorage.getItem('sidebarData');
    if (savedSidebarData) {
      setSidebarData(JSON.parse(savedSidebarData));
    }
  
    fetchChatDetails();
  }, [chatroomId]);  
  

  const handleDropdownChange = (value: string) => {
    setSelectedCategory(value); // 카테고리 선택 시 상태 업데이트
    console.log('드롭다운에서 선택된 값:', value); // 선택된 값을 로그로 출력
  
    // Ensure chatroomId is set before using it
    if (chatroomId) {
      if (value === 'RETROSPECTIVE') {
        console.log('회고 페이지로 이동:', `/retrospect/${chatroomId}`);
        navigate(`/retrospect/${chatroomId}`);
      } else {
        console.log('카테고리 페이지로 이동:', `/${value.toLowerCase()}/${chatroomId}`);
        navigate(`/${value.toLowerCase()}/${chatroomId}`);
      }
    } else {
      console.error('chatroomId가 설정되지 않았습니다.');
    }
  };

  const handleNewMessage = async (message: Message[]) => {
    try {
      setIsLoading(true);
      const apiUrl = `/main/ask/${chatroomId}?categoryType=CODE`;
      const response = await fetchWithToken(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: message[0].input,
        }),
      });
  
      const responseData = await response.json();
      let responseMessageContent = responseData.data;
  
      // 데이터를 \n으로 분할하여 배열로 저장하고 JSX에서 줄바꿈 및 들여쓰기를 반영
      const formattedContent = responseMessageContent.split('\n').map((line: string, index: number) => (
        <React.Fragment key={index}>
          {line.split('\t').map((segment, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span style={{ marginLeft: '2em' }}></span>}
              {segment}
            </React.Fragment>
          ))}
          <br />
        </React.Fragment>
      ));
  
      const numericChatroomId = chatroomId ? parseInt(chatroomId, 10) : null;

      if (numericChatroomId === null || isNaN(numericChatroomId)) {
        console.error("Invalid chatroomId");
        return; // chatroomId가 유효하지 않으면 컴포넌트 렌더링을 중단합니다.
      }

      const responseMessage: Message = {
        chatroomId: numericChatroomId, // chatroomId를 number로 변환한 값 사용
        type: 'text',
        input: message[0].input,
        output: formattedContent, // 줄바꿈 적용된 JSX 배열로 저장
      };
  
      setQuestions(prevQuestions => [...prevQuestions, responseMessage]);
      localStorage.setItem(`chatroom-${currentChatroomId}`, JSON.stringify({ questions: [...questions, responseMessage] }));
  
      console.log('질문에 대한 응답을 받았습니다.', responseMessage);
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const handleNewProject = (chatroomId: number, projectName: string) => {
    const newProject = {
      chatroomId,
      title: projectName,
      category: 'PLAN', // 기본 카테고리 설정
    };
    
    // setSidebarData([...sidebarData, newProject]); // 새로운 프로젝트를 사이드바 데이터에 추가
    setSidebarData((prevData) => {
      const updatedData = [...prevData, newProject];
      localStorage.setItem('sidebarData', JSON.stringify(updatedData));  // 데이터 저장
      return updatedData;
    });
    setIsPopupOpen(false); // 팝업 닫기
    setCurrentChatroomId(chatroomId);
    setProjects([...projects, projectName]); // 프로젝트 목록에 추가
    console.log("새 프로젝트 생성 완료");
    navigate(`/project/${chatroomId}`);
  };

  const numericChatroomId = chatroomId ? parseInt(chatroomId, 10) : null;


  return (
    <div className="project-page">
      <div className="sidebar-container">
        <NewSidebar

          // questionTitles={questionTitles}
          // onItemClick={handleItemClick}
          // onDeleteClick={handleDeleteClick}
          questionTitles={sidebarData} // 업데이트된 sidebarData 전달
          onItemClick={(chatroomId, category) => console.log(`Chatroom ${chatroomId} clicked`)}
          onDeleteClick={(chatroomId) => setSidebarData(sidebarData.filter(item => item.chatroomId !== chatroomId))}
        />
      </div>
      <MainContent>
      <NewChatButton onClick={togglePopup}>
          <LuFilePlus />
          <ul className="button-new">
            <li>create new project</li>
          </ul>
      </NewChatButton>
        {/* <SaveChatButton onClick={handleSaveChatroom}>
          <MdOutlineSaveAlt size={12} />
          <ul className="button-save">
            <li>save project</li>
          </ul>
        </SaveChatButton> */}
        <div>
          {isLoading ? <Spinner /> : null }
        </div>

        {numericChatroomId !== null ? (
        <ChatInterface
          chatroomId={numericChatroomId} // chatroomId를 숫자로 변환하여 전달
          onNewMessage={handleNewMessage}
          category="CODE"
          questions={questions} // 현재 질문 배열
        />
      ) : (
        <p>Chatroom ID가 설정되지 않았습니다.</p>
      )}
        
      </MainContent>

      <CenteredDropdownContainer>
        <Dropdown
          options={options}
          selected={selectedCategory} // 선택된 카테고리 표시
          onChange={handleDropdownChange} // 드롭다운 선택 시 함수 호출
          isOpen={isDropdownOpen}
          setIsOpen={setIsDropdownOpen}
        />
      </CenteredDropdownContainer>

      <ProjectPopup
        isPopupVisible={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onAddProject={handleNewProject}
      />
    </div>
  );
};

export default CodePage;

const MainContent = styled.div`
  flex-grow: 1;
  padding: 20px;
  margin-left: 200px; 
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const NewChatButton = styled.button`
  position: fixed;
  left: 16%;
  top: 15px;
  padding: 10px 20px;
  background-color: transparent;
  color: black;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    color: #006FFF;
  }

  svg {
    width: 24px;
    height: 24px;
  }

  .button-new {
    list-style: none;
    padding: 0;
    margin: 0;
    visibility: hidden; /* 기본적으로 숨김 */
    opacity: 0;
    transition: visibility 0s, opacity 0.3s ease-in-out;
  }

  &:hover .button-new {
    visibility: visible; /* hover 시 보이도록 설정 */
    opacity: 1;
  }
`;

const SaveChatButton = styled.button`
  position: fixed;
  top: 15px;
  left : 20%;
  padding: 10px 20px;
  background-color: transparent;
  color: black;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    color: #006FFF;
  }

  svg {
    width: 24px;
    height: 24px;
  }

  .button-save {
    list-style: none;
    padding: 0;
    margin: 0;
    visibility: hidden; /* 기본적으로 숨김 */
    opacity: 0;
    transition: visibility 0s, opacity 0.3s ease-in-out;
  }

  &:hover .button-save {
    visibility: visible; /* hover 시 보이도록 설정 */
    opacity: 1;
  }
`;

const CenteredDropdownContainer = styled.div`
  position: fixed;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1001;
  width: auto;
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center; /* Align vertically in the center */
  gap: 10px; /* Optional: space between buttons */
  margin-bottom: 20px; /* Space below buttons */

  @media (max-width: 768px) {
    flex-direction: column; /* Stack buttons vertically on smaller screens */
    gap: 5px;
  }
`;


const FixedChatInterface = styled(ChatInterface)`
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 30px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  border-radius: 8px;
  background-color: #f9f9f9;
  z-index: 1000;
`;

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;