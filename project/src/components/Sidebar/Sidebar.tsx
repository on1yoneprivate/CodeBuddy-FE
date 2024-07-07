// src/components/Sidebar.tsx
import React from 'react';
import { DivOption } from '../../types';
import "./sidebar.css";


const menuOptions: DivOption[] = [
    {
      optionName: '계획 설계',
      link: '/plan',
      fontSize: '1rem',
      fontFamily: 'Pretendard-Bold',
      fontColor: 'black',
      underlineHeight: '2px',
      isShownAlways: true,
      onClick: (e: React.MouseEvent<HTMLDivElement>) => {  // 적절한 타입 사용
        console.log("계획 설계 클릭됨", e)
      },
    },
    {
      optionName: '설계도 생성',
      link: '/blueprint',
      fontSize: '1rem',
      fontFamily: 'Pretendard-Bold',
      fontColor: 'black',
      underlineHeight: '2px',
    },
    {
      optionName: '코드 구현',
      link: '/code',
      fontSize: '1rem',
      fontFamily: 'Pretendard-Bold',
      fontColor: 'black',
      underlineHeight: '2px',
      isShownAlways: true
    },
    {
      optionName: '테스트 코드',
      link: '/testcode',
      fontSize: '1rem',
      fontFamily: 'Pretendard-Bold',
      fontColor: 'black',
      underlineHeight: '2px',
      isShownAlways: true
    },
    {
      optionName: '버전 관리',
      link: '/version',
      fontSize: '1rem',
      fontFamily: 'Pretendard-Bold',
      fontColor: 'black',
      underlineHeight: '2px',
      isShownAlways: true
    }
  ];
  
  const Sidebar: React.FC = () => {
    return (
        <div className="sidebar">
            <div className="sidebar-header">계획 설계</div>
            {menuOptions.map((option, index) => (
            <div key={index} className="menu-item" style={{
                fontSize: option.fontSize,
                fontFamily: option.fontFamily,
                color: option.fontColor,
                borderBottom: option.underlineHeight ? `2px solid ${option.fontColor}` : 'none',
            }} onClick={(e) => {  // MouseEvent 객체를 e로 받습니다.
                if (option.onClick) {
                option.onClick(e);  // 이벤트 객체 e를 onClick 핸들러에 전달합니다.
                } else {
                window.location.href = option.link;  // onClick이 정의되어 있지 않은 경우, 링크로 이동
                }
            }}>
                {option.optionName}
            </div>
        ))}
      </div>
    );
  };
  
  export default Sidebar;