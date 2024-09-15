import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';
import { MdDeleteForever } from "react-icons/md";

export interface SidebarProps {
  questionTitles: { chatroomId: number; title: string; category: string }[];
  onItemClick: (chatroomId: number, category: string) => void;
  onDeleteClick: (chatroomId: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ questionTitles, onItemClick, onDeleteClick }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  // 현재 카테고리 추출
  const currentCategory = currentPath.split('/')[1]; // URL의 첫 번째 segment를 카테고리로 사용

  // 현재 카테고리에 해당하는 질문만 필터링
  const filteredQuestions = questionTitles.filter(
    (question) => question.category === currentCategory
  );

  const handleDeleteClick = (chatroomId: number) => {
    const confirmDelete = window.confirm('삭제하시겠습니까?');
    if (confirmDelete) {
      onDeleteClick(chatroomId);
    }
  };

  return (
    <div className="sidebar">
      <Link to="/plan" className={`navigation-link ${currentPath === '/plan' ? 'active' : ''}`}>
        <button style={{ fontSize: '14px' }} >계획 설계</button>
      </Link>
      <Link to="/design" className={`navigation-link ${currentPath === '/design' ? 'active' : ''}`}>
        <button style={{ fontSize: '14px' }}>설계도 생성</button>
      </Link>
      <Link to="/code" className={`navigation-link ${currentPath === '/code' ? 'active' : ''}`}>
        <button style={{ fontSize: '14px' }}>코드 구현</button>
      </Link>
      <Link to="/testcode" className={`navigation-link ${currentPath === '/testcode' ? 'active' : ''}`}>
        <button style={{ fontSize: '14px' }}>테스트코드</button>
      </Link>
      <Link to="/version" className={`navigation-link ${currentPath === '/version' ? 'active' : ''}`}>
        <button style={{ fontSize: '14px' }}>배포</button>
      </Link>
      <ul className="question-list">
        {filteredQuestions.map(({ chatroomId, title, category }, index) => (
          <li 
            key={`${chatroomId}-${index}`} 
            onClick={() => onItemClick(chatroomId, category)}
            className={`question-item ${currentPath === `/${category}/${chatroomId}` ? 'active' : ''}`}
          >
            {title}
            <button onClick={(e) => {
              e.stopPropagation(); // onItemClick이 호출되지 않도록 이벤트 전파를 막습니다.
              handleDeleteClick(chatroomId);
            }}><MdDeleteForever size={24}/></button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
