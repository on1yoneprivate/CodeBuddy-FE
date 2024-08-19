import React from 'react';
import axios from 'axios';
<<<<<<< HEAD
import { Navigate, useNavigate } from 'react-router-dom';
import { fetchWithToken } from '../api/fetchWithToken';
=======
import { useNavigate } from 'react-router-dom';
import { LuLogOut } from "react-icons/lu";
import { fetchWithToken } from '../api/fetchWithToken';
import './Logout.css';
>>>>>>> 5bc8364 (디자인 수정 중)

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
<<<<<<< HEAD
              navigate('/init');
=======
              navigate('/');
>>>>>>> 5bc8364 (디자인 수정 중)
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
<<<<<<< HEAD
    <button onClick={handleLogout} style={styles.button}>
      로그아웃
=======
    <button className="logout-button" onClick={handleLogout}>
      <LuLogOut />
      <span className="discribe">Logout</span> {/* 툴팁 요소 */}
>>>>>>> 5bc8364 (디자인 수정 중)
    </button>
  );
};

<<<<<<< HEAD
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


=======
>>>>>>> 5bc8364 (디자인 수정 중)
export default LogoutButton;