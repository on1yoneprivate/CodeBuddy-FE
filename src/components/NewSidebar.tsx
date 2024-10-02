import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './NewSidebar.css';
import { MdDeleteForever, MdMenu } from "react-icons/md";
import Dropdown from './Dropdown';  // Dropdown 컴포넌트 가져오기
import { fetchWithToken } from '../api/fetchWithToken';

export interface SidebarProps {
  questionTitles: { chatroomId: number; title: string; category: string }[];
  onItemClick: (chatroomId: number, category: string) => void;
  onDeleteClick: (chatroomId: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ questionTitles, onItemClick, onDeleteClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // 상태 추가: 클릭된 프로젝트 추적
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 드롭다운 열림/닫힘 상태 관리
  const [selectedCategory, setSelectedCategory] = useState<string>('PLAN'); // 드롭다운에서 선택된 카테고리
  const [chatData, setChatData] = useState<any[]>([]); // 채팅 데이터 상태

  // 드롭다운에 사용할 옵션 목록
  const options = [
    { label: '계획 설계', value: 'plan' },
    { label: '설계도 생성', value: 'design' },
    { label: '코드 생성', value: 'code' },
    { label: '회고', value: 'retrospective' },
  ];

  // 프로젝트 클릭 시 이동할 경로 설정 및 드롭다운 토글
  const handleProjectClick = async (chatroomId: number) => {
    if (activeProjectId === chatroomId) {
      setActiveProjectId(null);
      setIsDropdownOpen(false);
    } else {
      setActiveProjectId(chatroomId);
      setIsDropdownOpen(true);
      setSelectedCategory('PLAN'); // 기본값으로 'PLAN' 설정
      navigate(`/plan/${chatroomId}`);
      console.log("navigate start");

      // PLAN 카테고리의 데이터를 불러오기
      await fetchChatData(chatroomId, 'PLAN');
    }
  };

  // 선택된 카테고리의 채팅 데이터를 불러오는 함수
  const fetchChatData = async (chatroomId: number, categoryType: string) => {
    try {
      const response = await fetchWithToken(`/chats/${chatroomId}?categoryType=${categoryType.toUpperCase()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chat details');
      }

      const data = await response.json();
      console.log(`${categoryType.toUpperCase()} 카테고리 데이터:`, data);
      setChatData(data); // 데이터를 상태로 저장하여 렌더링할 수 있게 함
    } catch (error) {
      console.error('채팅 데이터를 불러오는 중 에러:', error);
    }
  };

  // 드롭다운에서 카테고리 선택 시 해당 카테고리의 데이터를 불러오고 경로 이동
  const handleCategoryChange = (chatroomId: number, categoryType: string) => {
    setSelectedCategory(categoryType.toUpperCase());
    navigate(`/${categoryType}/${chatroomId}`);

    // 선택된 카테고리의 채팅 데이터를 불러오기
    fetchChatData(chatroomId, categoryType);
  };

  const handleDeleteClick = (chatroomId: number) => {
    const confirmDelete = window.confirm('삭제하시겠습니까?');
    console.log("프로젝트 삭제 시작");
    if (confirmDelete) {
      onDeleteClick(chatroomId);
    }
    console.log("프로젝트 삭제 완료");
  };

  return (
    <div className="sidebar">
      <div className="header">
        <MdMenu size={24} className="header-icon" />  {/* 좌측 아이콘 */}
        <span>Hide Sidebar</span>  {/* 우측 텍스트 */}
      </div>

      <ul className="project-list">
        {/* 부모로부터 전달받은 questionTitles 사용 */}
        {questionTitles.map(({ chatroomId, title }) => (
          <div key={chatroomId}>
            {/* 프로젝트가 클릭되면 다른 프로젝트는 숨기고, 클릭된 프로젝트만 표시 */}
            {activeProjectId === null || activeProjectId === chatroomId ? (
              <li
                onClick={() => handleProjectClick(chatroomId)} // 클릭 시 경로 변경 및 드롭다운 토글
                className={`project-item ${currentPath.includes(`/project/${chatroomId}`) ? 'active' : ''}`}
              >
                {title}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // 클릭이 프로젝트 이동을 방해하지 않도록
                    handleDeleteClick(chatroomId);
                  }}
                >
                  <MdDeleteForever size={18} className="delete-button" />
                </button>
              </li>
            ) : null}

            {/* 드롭다운: 클릭된 프로젝트만 드롭다운 표시 */}
            {activeProjectId === chatroomId && (
              <Dropdown
                options={options}  // 여기에 옵션 전달
                selected={null}
                onChange={(value: string) => {
                  setSelectedCategory(value.toUpperCase()); // 선택된 카테고리 업데이트
                  console.log('드롭다운 선택된 값:', value);
                  // 선택된 카테고리와 chatroomId로 경로 이동
                  navigate(`/${value}/${chatroomId}`);
                }}
                isOpen={isDropdownOpen}    // 드롭다운 열림/닫힘 상태 전달
                setIsOpen={setIsDropdownOpen} // 드롭다운 상태 관리 함수 전달
              />
            )}
          </div>
        ))}
      </ul>

    </div>
  );
};

export default Sidebar;