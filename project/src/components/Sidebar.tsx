import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

export interface SidebarProps {
  questionTitles: { chatroomId: string; title: string; category: string }[];
  onItemClick: (chatroomId: string, category: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ questionTitles, onItemClick }) => {
  const location = useLocation();
  const currentPath = location.pathname;

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
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
