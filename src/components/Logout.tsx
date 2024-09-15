import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LuLogOut } from "react-icons/lu";
import { fetchWithToken } from '../api/fetchWithToken';
import './Logout.css';

const LogoutButton: React.FC = () => {
    const navigate = useNavigate();
    
    const handleLogout = async () => {
        const loginId = localStorage.getItem('loginId');
        if (!loginId) {
          console.error('로그인 아이디가 없습니다.');
          return;
        }
    
        try {
          const response = await fetchWithToken('/users/logout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ loginId }),
          });
    
          if (response.status === 200) {
            const data = await response.json();
            if (data.success === true) {
              console.log('로그아웃 성공');
              navigate('/init');
            } else {
              console.error('로그아웃 실패', data.message);
            }
          } else {
            console.error('로그아웃 실패', response.statusText);
          }
        } catch (error) {
          console.error('로그아웃 실패', error);
          // 에러 처리를 여기에 추가하세요.
        }
      };

  return (
    <button className="logout-button" onClick={handleLogout}>
      <LuLogOut />
      <span className="discribe">Logout</span> {/* 툴팁 요소 */}
    </button>
  );
};

const styles = {
    button: {
      position: 'absolute' as 'absolute',
      top: '40px',
      right: '30px',
      padding: '10px',
      backgroundColor: '#007bff',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
    },
};

export default LogoutButton;