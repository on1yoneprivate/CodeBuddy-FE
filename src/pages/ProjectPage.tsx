import React, { useEffect, useState } from 'react';
import NewSidebar from '../components/NewSidebar'; 
import Plan from '../components/Plan'; 
import styled from 'styled-components';
import ChatInterface from '../components/ChatInterface';
import { LuFilePlus } from 'react-icons/lu';
import { MdOutlineSaveAlt } from 'react-icons/md';
import Dropdown from '../components/Dropdown';
import Spinner from '../components/Spinner';
import { Message } from '../types/Message';  
import { QuestionTitle } from '../types/ChatroomProps'; 
import { fetchWithToken } from '../api/fetchWithToken';
import { useChatroom } from '../context/ChatroomContext';
import { handleNewChatroom } from '../utils/chatUtils';
import Sidebar from '../components/NewSidebar';
import { useNavigate, useParams } from 'react-router-dom';
import ProjectPopup from '../components/ProjectPopup';

const initialQuestions: Message[] = []; 
const initialQuestionTitles: QuestionTitle[] = [
  { chatroomId: 1, title: '프로젝트 1', category: 'plan' },
  { chatroomId: 2, title: '프로젝트 2', category: 'design' },
  { chatroomId: 3, title: '프로젝트 3', category: 'code' }
];

const ProjectPage = () => {
  const [questions, setQuestions] = useState<Message[]>(initialQuestions);
  const [currentChatroomId, setCurrentChatroomId] = useState<number | null>(null);
  const [categoryChatroomIds, setCategoryChatroomIds] = useState<{ [key: string]: number }>({});
  const chatroomContext = useChatroom();
  const [isLoading, setIsLoading] = useState(false);
  const [chatroomId, setChatroomId] = useState(1);
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
    { label: '회고', value: 'retrospective' },
  ];

  const [sidebarData, setSidebarData] = useState<QuestionTitle[]>(initialQuestionTitles);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // 컴포넌트가 처음 렌더링될 때 localStorage에서 데이터 불러오기
  useEffect(() => {
    const savedChatroomId = localStorage.getItem('currentChatroomId');
    if (savedChatroomId) {
      setCurrentChatroomId(parseInt(savedChatroomId, 10));
    }
  
    const savedSidebarData = localStorage.getItem('sidebarData');
    if (savedSidebarData) {
      setSidebarData(JSON.parse(savedSidebarData));
    }

    if (currentChatroomId) {
      setActiveProjectId(currentChatroomId);
      setChatroomId(currentChatroomId);
      console.log(`초기 activeProjectId 설정됨: ${currentChatroomId}`);
    }
  }, [currentChatroomId]);
  

  // 채팅방 클릭 시 실행되는 함수
  const handleItemClick = (chatroomId: number, category: string) => {
    setChatroomId(chatroomId);
    setActiveProjectId(chatroomId); // activeProjectId 설정
    console.log(`Chatroom ${chatroomId}이(가) 선택되었습니다. 카테고리: ${category}`);
    console.log(`activeProjectId가 설정되었습니다: ${chatroomId}`);
  };  
  

  const handleDeleteClick = async (chatroomId: number) => {
    try {
      const response = await fetchWithToken(`/delete/${chatroomId}`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Server error: ${response.status}');
      }

      setSidebarData(prevSidebarData => prevSidebarData.filter(item => item.chatroomId !== chatroomId));
      localStorage.removeItem(`chatroom-${chatroomId}`);
      console.log('저장된 채팅방을 삭제합니다.', `chatroomId: ${chatroomId}`);
    } catch (error) {
      console.error('Error deleting chatroom:', error);
    }
  };

  const handleSaveChatroom = async () => {
    if (currentChatroomId === null) return;
    
    try {
      const apiUrl = `/save/${currentChatroomId}`;
      const response = await fetchWithToken(apiUrl, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to save chatroom');
      }

      const newSidebarItem: QuestionTitle = {
        chatroomId: currentChatroomId,
        title: questions[0]?.input.substring(0, 10) || 'No title',
        category: 'plan',
      };

      setSidebarData(prevSidebarData => [...prevSidebarData, newSidebarItem]);
      //localStorage.setItem(`chatroom-${currentChatroomId}, JSON.stringify({ questions })`);
      localStorage.setItem('sidebarData', JSON.stringify([...sidebarData, newSidebarItem]));

      console.log('채팅방이 저장되었습니다.', { questions });
    } catch (error) {
      console.error('Error saving chatroom:', error);
    }
  };

  const handleNewMessage = async (message: Message[]) => {
    if (!selectedCategory) {
      console.error('No category selected for sending a message.');
      return;
    }
  
    try {
      setIsLoading(true);
      const apiUrl = `/main/ask/${currentChatroomId}?categoryType=${selectedCategory.toUpperCase()}`;
      console.log('API Request URL:', apiUrl);
  
      const response = await fetchWithToken(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: message[0].input,
        }),
      });
  
      if (!response.ok) { // 서버 응답이 200번대가 아니면 예외 처리
        console.error('Error response from API:', response.status, response.statusText);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
  
      const responseData = await response.json();
  
      // 전체 응답을 로그로 확인
      console.log('API responseData:', responseData);
  
      let responseMessageContent = responseData?.data || responseData?.message || responseData?.result?.message;
  
      if (!responseMessageContent) {
        console.error('No content in response:', responseData);
        return;
      }
  
      // 나머지 로직은 동일
      let responseMessage: Message | null = null;
      let formattedContent;
      if (currentChatroomId === null) return;
  
      switch (selectedCategory) {
        case 'plan':
          formattedContent = responseMessageContent.split('\n').map((line: string, index: number) => (
            <React.Fragment key={index}>
              <b>{line}</b> {/* Bold format for 'plan' */}
              <br />
            </React.Fragment>
          ));
  
          responseMessage = {
            chatroomId: currentChatroomId,
            type: 'text',
            input: message[0].input,
            output: formattedContent,
          };
          break;
  
        case 'design':
          if (responseData.data?.includes('b64_json')) {
            console.log('Starting image decoding...');
  
            const base64Image = responseData.data.match(/"b64_json":"(.*?)"/)?.[1];
            let description = responseData.data.split('\n\n')[1] || "No description available";
  
            description = description.replace(/\n/g, '<br/>');
  
            if (base64Image) {
              responseMessage = {
                chatroomId: currentChatroomId,
                type: 'image',
                input: message[0].input,
                output: base64Image,
                description: description,
              };
            } else {
              console.error('Failed to extract Base64 image data.');
              return;
            }
          } else {
            formattedContent = responseMessageContent.split('\n').map((line: string, index: number) => (
              <React.Fragment key={index}>
                <i>{line}</i> {/* Apply italic for design-related responses */}
                <br />
              </React.Fragment>
            ));
  
            responseMessage = {
              chatroomId: currentChatroomId,
              type: 'text',
              input: message[0].input,
              output: formattedContent,
            };
          }
          break;
  
        case 'develop':
          formattedContent = responseMessageContent.split('\n').map((line: string, index: number) => (
            <React.Fragment key={index}>
              <span style={{ color: 'blue' }}>{line}</span> {/* Blue text for 'develop' */}
              <br />
            </React.Fragment>
          ));
  
          responseMessage = {
            chatroomId: currentChatroomId,
            type: 'text',
            input: message[0].input,
            output: formattedContent,
          };
          break;
  
        default:
          formattedContent = responseMessageContent.split('\n').map((line: string, index: number) => (
            <React.Fragment key={index}>
              {line}
              <br />
            </React.Fragment>
          ));
  
          responseMessage = {
            chatroomId: currentChatroomId,
            type: 'text',
            input: message[0].input,
            output: formattedContent,
          };
          break;
      }
  
      if (responseMessage) { // null이 아닌 경우에만 처리
        setQuestions((prevQuestions) => [...prevQuestions, responseMessage as Message]);
        
        // PUT 요청으로 서버에 저장
        const saveApiUrl = `/save/${currentChatroomId}`;
        const saveResponse = await fetchWithToken(saveApiUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: responseMessage.input,
            output: responseMessage.output,
          }),
        });
      
        if (!saveResponse.ok) {
          console.error('Error saving message to server:', saveResponse.status, saveResponse.statusText);
          throw new Error(`Failed to save message: ${saveResponse.status}`);
        }
      
        console.log('Message successfully saved to server.');
      }
      
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsLoading(false);
    }
  };
   

  // Dropdown에서 옵션이 선택되었을 때 실행되는 함수
  const handleOptionClick = (chatroomId: number, category: string) => {
    if (activeProjectId === chatroomId) {
      setActiveProjectId(null);
      setIsDropdownOpen(false);
      console.log('드롭다운 닫힘');
    } else {
      setActiveProjectId(chatroomId);
      setIsDropdownOpen(true);
      console.log('드롭다운 열림');
    }

    if (selectedCategory) {
      const apiUrl = `/main/ask/${chatroomId}?categoryType=${selectedCategory.toUpperCase()}`;
      console.log('API Request URL:', apiUrl); // API 경로를 콘솔에 출력
      navigate(`/${selectedCategory}/${chatroomId}`); // 선택된 카테고리에 따라 페이지 이동
    }
  };

  // Dropdown에서 선택 시 동작
  const handleDropdownChange = (value: string) => {
    setSelectedCategory(value); // 카테고리 선택 시 상태 업데이트
    console.log('드롭다운에서 선택된 값:', value); // 선택된 값을 로그로 출력

    if (!chatroomId) {
      console.error('activeProjectId가 설정되지 않았습니다.');
      return;
    }

    if (value === 'retrospective') {
      console.log('회고 페이지로 이동:', `/retrospect/${chatroomId}`); // 회고 페이지 경로를 로그로 출력
      navigate(`/retrospect/${chatroomId}`);
    }
  };
  
  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const handleNewProject = (chatroomId: number, projectName: string) => {
    const newProject = {
      chatroomId,
      title: projectName,
      category: 'plan', // 기본 카테고리 설정
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
        {currentChatroomId !== null && (
          <FixedChatInterface
            chatroomId={currentChatroomId as number}  // 여기서 null이 아니라고 보장
            onNewMessage={handleNewMessage}
            category={'PLAN'}
            questions={questions}
          />
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

export default ProjectPage;

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