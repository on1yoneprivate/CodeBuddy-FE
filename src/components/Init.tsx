import React from 'react';
import { useNavigate } from 'react-router-dom';
import './init.css';

const Init: React.FC = () => {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/login');
        console.log('로그인 버튼 클릭');
    };

    const handleSignUpClick = () => {
        navigate('/signup');
        console.log('회원가입 버튼 클릭');
    };

    return (
        <div className="init-container">
            <button className="init-button" onClick={handleLoginClick}>
                로그인
            </button>
            <button className="init-button" onClick={handleSignUpClick}>
                회원 가입
            </button>
        </div>
    );
};

export default Init;