import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProjectName from '../components/ProjectName';
import Dropdown from '../components/Dropdown';
import './RetrospectPage.css';
import RetroInput from '../components/RetroInput';
import RetrospectBtn from '../components/RetrospectBtn';
import Sidebar from '../components/NewSidebar';
import Retrospect from '../components/Retrospect';
import { fetchWithToken } from '../api/fetchWithToken';

const RetrospectPage: React.FC = () => {
  const { chatroomId } = useParams<{ chatroomId: string }>(); // URL에서 chatroomId 추출
  const [loginId, setLoginId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showRetrospect, setShowRetrospect] = useState(false);
  const [loading, setLoading] = useState(true); // 데이터 로딩 상태
  const [isSubmitting, setIsSubmitting] = useState(false); // 데이터 전송 중 상태 관리
  const [retrospectData, setRetrospectData] = useState<string | null>(null);
  const navigate = useNavigate();
  // 서버에서 받아온 데이터를 카테고리별로 저장할 상태
  const [planData, setPlanData] = useState<string | null>(null);
  const [designData, setDesignData] = useState<string | null>(null);
  const [codeData, setCodeData] = useState<string | null>(null);

  const [keepContent, setKeepContent] = useState<{ plan: string, design: string, code: string }>({ plan: '', design: '', code: '' });
  const [problemContent, setProblemContent] = useState<{ plan: string, design: string, code: string }>({ plan: '', design: '', code: '' });
  const [tryContent, setTryContent] = useState<{ plan: string, design: string, code: string }>({ plan: '', design: '', code: '' });

  const [chatIds, setChatIds] = useState<{ plan: string, design: string, code: string }>({ plan: '', design: '', code: '' }); // chatId 관리
  const [topics, setTopics] = useState<{ plan: string, design: string, code: string }>({ plan: '', design: '', code: '' });

  useEffect(() => {
    const storedLoginId = localStorage.getItem('loginId');
    if (storedLoginId) {
      setLoginId(storedLoginId);
    } else {
      console.error('localStorage에서 loginId를 찾을 수 없습니다.');
    }

    if (chatroomId) {
      console.log(`Fetching data for chatroomId: ${chatroomId}`);

      // PLAN, DESIGN, CODE 데이터를 각각 가져옴
      Promise.all([
        fetchChatroomData(chatroomId, 'PLAN'),
        fetchChatroomData(chatroomId, 'DESIGN'),
        fetchChatroomData(chatroomId, 'CODE')
      ])
        .then(() => {
          setLoading(false);
          console.log('All chatroom data fetched successfully.');
        })
        .catch(err => {
          console.error('Failed to fetch chatroom data:', err);
        });

      // 회고 데이터를 가져옴
      console.log(`Fetching retrospective data for chatroomId: ${chatroomId}`);
      fetchRetrospectiveData(chatroomId)
        .then(() => {
          console.log('Retrospective data fetched successfully.');
        })
        .catch(err => {
          console.error('Failed to fetch retrospective data:', err);
        });
    }
  }, [chatroomId]);

  const fetchChatroomData = async (chatroomId: string, categoryType: string) => {
    try {
      const response = await fetchWithToken(`/chats/${chatroomId}?categoryType=${categoryType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log(`Fetched data for ${categoryType}:`, data);
  
        // Extract the first chatId from the data array
        const chat = data.data[0]; // 그냥 첫 번째 chatId와 message를 가져옴
        
        if (chat) {
          const chatId = chat.chatId;  // Extract the chatId
          const topic = chat.message;  // Extract the message as the topic
  
          console.log(`${categoryType} chatId:`, chatId);
          console.log(`${categoryType} topic:`, topic);
  
          // Update state based on categoryType
          if (categoryType === 'PLAN') {
            setChatIds(prev => ({ ...prev, plan: chatId }));
            setTopics(prev => ({ ...prev, plan: topic }));
          } else if (categoryType === 'DESIGN') {
            setChatIds(prev => ({ ...prev, design: chatId }));
            setTopics(prev => ({ ...prev, design: topic }));
          } else if (categoryType === 'CODE') {
            setChatIds(prev => ({ ...prev, code: chatId }));
            setTopics(prev => ({ ...prev, code: topic }));
          }
        } else {
          console.warn(`${categoryType} 데이터가 없습니다.`);
        }
      } else {
        console.error('Failed to fetch chatroom data');
      }
    } catch (error) {
      console.error('Error fetching chatroom data:', error);
    }
  };

  

  // 줄바꿈과 들여쓰기를 처리하는 함수
  const formatCode = (message: string) => {
    return message
      .replace(/\n/g, '<br>')        // 줄바꿈을 <br> 태그로 변환
      .replace(/ {4}/g, '&nbsp;&nbsp;&nbsp;&nbsp;')  // 공백 4칸을 &nbsp;로 변환
      .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');    // 탭 문자를 &nbsp;로 변환
  };

  // 회고 데이터를 서버에서 가져오는 함수
  const fetchRetrospectiveData = async (chatroomId: string) => {
    try {
      console.log(`Fetching retrospective data for chatroomId: ${chatroomId}`);

      const response = await fetchWithToken(`/chats/retrospect/${chatroomId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Received retrospective data:', result);

        // Process the non-empty data
        result.data.forEach((item: { categoryType: string; message: string }) => {
          switch (item.categoryType) {
            case "PLAN":
              setPlanData(formatCode(item.message));
              break;
            case "DESIGN":
              setDesignData(formatCode(item.message));
              break;
            case "CODE":
              setCodeData(formatCode(item.message));
              break;
            default:
              console.warn("Unknown category type:", item.categoryType);
          }
        });
      } else {
        const errorMessage = await response.text();
        console.error('Failed to fetch retrospective data:', errorMessage);
      }
    } catch (error) {
      console.error("An error occurred while fetching retrospective data:", error);
    }
  };

  const submitData = async () => {
    setIsSubmitting(true);
  
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('Access token not found in localStorage');
      setIsSubmitting(false);
      return;
    }
  
    // Create the chatData array based on available categories
    const chatData = [
      {
        chatId: chatIds.plan ? Number(chatIds.plan) : null,
        topic: topics.plan || null,
        keepContent: keepContent.plan || '',
        problemContent: problemContent.plan || '',
        tryContent: tryContent.plan || '',
      },
      {
        chatId: chatIds.design ? Number(chatIds.design) : null,
        topic: topics.design || null,
        keepContent: keepContent.design || '',
        problemContent: problemContent.design || '',
        tryContent: tryContent.design || '',
      },
      {
        chatId: chatIds.code ? Number(chatIds.code) : null,
        topic: topics.code || null,
        keepContent: keepContent.code || '',
        problemContent: problemContent.code || '',
        tryContent: tryContent.code || '',
      },
    ];
  
    // Filter out entries where chatId and topic are not set
    const filteredData = chatData.filter(item => item.chatId !== null && item.topic !== null);
  
    if (filteredData.length === 0) {
      console.log('No data to send.');
      setIsSubmitting(false);
      return;
    }
  
    console.log('Sending data:', filteredData);
  
    try {
      const response = await fetchWithToken(`/main/ask/${chatroomId}/retrospect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filteredData),
      });
  
      if (!response.ok) {
        const errorMessage = await response.text();
        console.error('Failed to send data:', errorMessage);
        throw new Error('데이터 전송에 실패했습니다.');
      }
  
      const responseData = await response.json();
      console.log('Received response:', responseData);
  
      if (responseData.success) {
        setRetrospectData(responseData.data); // Successfully sent data
        setShowRetrospect(true); // Show retrospective on success
      }
  
    } catch (error) {
      console.error('Error sending data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };  
  

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

  const handleCreateClick = () => {
    setShowRetrospect(true); // Set state to show Retrospect component
  };


  return (
    <>
      <div className="sidebar-container">
        {/* Sidebar */}
      </div>
      <>
        {/* Dropdown 컴포넌트 */}
        <div className='category'>
          <Dropdown
            options={[
              { label: '계획 설계', value: 'PLAN' },
              { label: '설계도 생성', value: 'DESIGN' },
              { label: '코드 생성', value: 'CODE' },
              { label: '회고', value: 'RETROSPECTIVE' },
            ]}
            selected={selectedCategory}
            onChange={(value: string) => {
              setSelectedCategory(value);
              console.log('드롭다운에서 선택된 값:', value);
            }}
            isOpen={isDropdownOpen}
            setIsOpen={setIsDropdownOpen}
          />
        </div>

        <div className='project-name'>
          {/* loginId가 있을 경우 ProjectName 컴포넌트를 렌더링 */}
          {loginId && chatroomId ? (
            <ProjectName loginId={loginId} chatroomId={Number(chatroomId)} /> // chatroomId를 URL에서 가져옴
          ) : (
            <p>로그인이 필요합니다.</p>
          )}
        </div>

        <div className="main">
          <RetroInput
            stageTitle="계획 단계"
            fetchData={() => Promise.resolve(planData ?? '')} // 서버에서 받은 데이터를 전달
            submitData={(key, value) => {
              if (key === 'K') setKeepContent((prev) => ({ ...prev, plan: value }));
              if (key === 'P') setProblemContent((prev) => ({ ...prev, plan: value }));
              if (key === 'T') setTryContent((prev) => ({ ...prev, plan: value }));
            }} // 데이터 전송 함수 추가
          />
          <RetroInput
            stageTitle="설계 단계"
            fetchData={() => Promise.resolve(designData ?? '')} // 서버에서 받은 데이터를 전달
            submitData={(key, value) => {
              if (key === 'K') setKeepContent((prev) => ({ ...prev, design: value }));
              if (key === 'P') setProblemContent((prev) => ({ ...prev, design: value }));
              if (key === 'T') setTryContent((prev) => ({ ...prev, design: value }));
            }} // 데이터 전송 함수 추가
          />
          <div className='retro-code'>
            <RetroInput
              stageTitle="코드 단계"
              fetchData={() => Promise.resolve(codeData ?? '')} // 서버에서 받은 데이터를 전달
              submitData={(key, value) => {
                if (key === 'K') setKeepContent((prev) => ({ ...prev, code: value }));
                if (key === 'P') setProblemContent((prev) => ({ ...prev, code: value }));
                if (key === 'T') setTryContent((prev) => ({ ...prev, code: value }));
              }} // 데이터 전송 함수 추가
            />
          </div>
          <div className='create-retrospect'>
            {showRetrospect && <Retrospect data={retrospectData} />}
          </div>
        </div>

        <div className='send'>
          <RetrospectBtn onClick={submitData} disabled={isSubmitting} /> {/* 클릭 시 데이터 전송 */}
        </div>
      </>
    </>
  );
};

export default RetrospectPage;
