import React from 'react';
import './RetrospectBtn.css';

interface RetrospectBtnProps {
  onClick: () => void;
  disabled?: boolean; // disabled 속성 추가
}

const RetrospectBtn: React.FC<RetrospectBtnProps> = ({ onClick, disabled }) => {
  return (
    <button onClick={onClick} className="retrospect-btn" disabled={disabled}>
      생성하기
    </button>
  );
};

export default RetrospectBtn;
