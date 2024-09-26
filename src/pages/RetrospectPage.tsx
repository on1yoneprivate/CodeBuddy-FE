import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // useParams 훅을 사용하여 URL에서 chatroomId 추출
import ProjectName from '../components/ProjectName'; // ProjectName 컴포넌트 임포트
import Dropdown from '../components/Dropdown'; // Dropdown 컴포넌트 임포트
import './RetrospectPage.css';
import RetroInput from '../components/RetroInput';
import RetrospectBtn from '../components/RetrospectBtn';
import Sidebar from '../components/NewSidebar';

const RetrospectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // URL에서 chatroomId 추출
  const [loginId, setLoginId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    // localStorage에서 loginId를 가져옴
    const storedLoginId = localStorage.getItem('loginId');
    if (storedLoginId) {
      setLoginId(storedLoginId);
    } else {
      console.error('localStorage에서 loginId를 찾을 수 없습니다.');
    }
  }, []);

  const fetchPlanningData = async () => {
    // 서버 요청을 대신하여 임의의 데이터를 반환
    return Promise.resolve('계획 단계에서 받아온 데이터');
  };

  const fetchDesignData = async () => {
    return Promise.resolve('설계 단계에서 받아온 데이터');
  };

  const fetchCodeData = async () => {
    return Promise.resolve('코드 단계에서 받아온 데이터');
  };

  // 서버로 데이터를 전송하는 함수 (예시: POST 요청)
  const submitData = async (stage: string, value: string) => {
    try {
      const response = await fetch(`/api/chatroom/${id}/retrospective`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginId,
          stage,
          content: value,
        }),
      });

      if (!response.ok) {
        throw new Error('데이터 전송에 실패했습니다.');
      }

      console.log(`서버로 ${stage} 단계 데이터 전송 성공:`, value);
    } catch (error) {
      console.error(`서버로 ${stage} 단계 데이터 전송 실패:`, error);
    }
  };

  return (
    <>
      <div className="sidebar-container">
        
      </div>
      {/* Dropdown 컴포넌트 */}
      <div className='category'>
        <Dropdown
          options={[
            { label: '계획 설계', value: 'PLAN' },
            { label: '설계도 생성', value: 'design' },
            { label: '코드 생성', value: 'code' },
            { label: '회고', value: 'retrospective' },
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
        {loginId && id ? (
          <ProjectName loginId={loginId} chatroomId={Number(id)} /> // chatroomId를 URL에서 가져옴
        ) : (
          <p>로그인이 필요합니다.</p>
        )}
      </div>

      <div className="main">
        <RetroInput
          stageTitle="계획 단계"
          fetchData={fetchPlanningData}
          submitData={submitData} // 데이터 전송 함수 추가
        />
        <RetroInput
          stageTitle="설계 단계"
          fetchData={fetchDesignData}
          submitData={submitData} // 데이터 전송 함수 추가
        />
        <RetroInput
          stageTitle="코드 단계"
          fetchData={fetchCodeData}
          submitData={submitData} // 데이터 전송 함수 추가
        />
      </div>

      <div className='send'>
        <RetrospectBtn />
      </div>
    </>
  );
};

export default RetrospectPage;
