import React from 'react';
import './Sidebar2.css';
import { Link } from 'react-router-dom';

interface SidebarProps {
  questionTitle: string;
}

const Sidebar: React.FC<SidebarProps> = ({ questionTitle }) => {
  return (
    <div className="sidebar">
      <Link to="/plan"><button>계획 설계</button></Link>
      <Link to="/blueprint"><button>설계도 생성</button></Link>
      <Link to="/code"><button>코드 구현</button></Link>
      <Link to="/testcode"><button>테스트코드</button></Link>
      <Link to="/version"><button>버전 관리</button></Link>
      <Link to="/"><button>{questionTitle || '이전에 검색했던 질문 리스트업'}</button></Link>
      <Link to="/"><button>이전에 검색했던 질문 리스트업</button></Link>
      <Link to="/"><button>이전에 검색했던 질문 리스트업</button></Link>
      <Link to="/"><button>이전에 검색했던 질문 리스트업</button></Link>
    </div>
  );
}

export default Sidebar;
