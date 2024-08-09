import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

export interface SidebarProps {
  questionTitles: { chatroomId: number; title: string; category: string }[];
  onItemClick: (chatroomId: number, category: string) => void;
  onDeleteClick: (chatroomId: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ questionTitles, onItemClick, onDeleteClick }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const handleDeleteClick = (chatroomId: number) => {
    const confirmDelete = window.confirm('삭제하시겠습니까?');
    if (confirmDelete) {
      onDeleteClick(chatroomId);
    }
  };

  return (
    <div className="sidebar">
      <Link to="/plan" className={`navigation-link ${currentPath === '/plan' ? 'active' : ''}`}>
        <button>계획 설계</button>
      </Link>
      <Link to="/design" className={`navigation-link ${currentPath === '/design' ? 'active' : ''}`}>
        <button>설계도 생성</button>
      </Link>
      <Link to="/code" className={`navigation-link ${currentPath === '/code' ? 'active' : ''}`}>
        <button>코드 구현</button>
      </Link>
      <Link to="/testcode" className={`navigation-link ${currentPath === '/testcode' ? 'active' : ''}`}>
        <button>테스트코드</button>
      </Link>
      <Link to="/version" className={`navigation-link ${currentPath === '/version' ? 'active' : ''}`}>
        <button>버전 관리</button>
      </Link>
      <ul className="question-list">
        {questionTitles.map(({ chatroomId, title, category }, index) => (
          <li 
            key={`${chatroomId}-${index}`} 
            onClick={() => onItemClick(chatroomId, category)}
            className={`question-item ${currentPath === `/${category}/${chatroomId}` ? 'active' : ''}`}
          >
            {title}
            <button onClick={(e) => {
              e.stopPropagation(); // onItemClick이 호출되지 않도록 이벤트 전파를 막습니다.
              handleDeleteClick(chatroomId);
            }}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
