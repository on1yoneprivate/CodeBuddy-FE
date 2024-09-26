import React, { useState, useEffect } from 'react';
import './RetroInput.css';

interface RetroInputProps {
  stageTitle: string;
  fetchData: () => Promise<string>; // 서버에서 데이터를 받아오는 함수
  submitData: (key: string, value: string) => Promise<void>; // 서버로 데이터를 전송하는 함수
}

const RetroInput: React.FC<RetroInputProps> = ({ stageTitle, fetchData, submitData }) => {
  const [isOpen, setIsOpen] = useState(true); // 컨테이너 열림 여부 상태
  const [serverData, setServerData] = useState(''); // 서버에서 받은 데이터 상태
  const [inputs, setInputs] = useState({ K: '', P: '', T: '' }); // 개별 입력 상태

  // 컴포넌트가 처음 렌더링될 때 서버에서 데이터 가져오기
  useEffect(() => {
    const getData = async () => {
      const data = await fetchData();
      setServerData(data);
    };
    getData();
  }, [fetchData]);

  // 열림/닫힘 상태 토글
  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  // 입력값 변경 핸들러
  const handleChange = (key: string) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputs((prevInputs) => ({ ...prevInputs, [key]: newValue }));

    // 서버로 값 전송
    submitData(key, newValue);
  };

  return (
    <div className="retroinput-container">
      <div className="header" onClick={toggleOpen}>
        <span className="icon">💬</span>
        <span className="stage-title">{stageTitle}</span>
        <span className="toggle-icon">{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && (
        <div className="content">
          <div className="server-data">
            {serverData} {/* 서버에서 받은 데이터 표시 */}
          </div>
          <div className="user-input">
            {/* 각각의 텍스트 입력 필드 */}
            <div>
              <span>K</span>
              <textarea
                value={inputs.K}
                onChange={handleChange('K')}
                placeholder="계획 명세서에 대한 내용을 입력하세요..."
              />
            </div>
            <div>
              <span>P</span>
              <textarea
                value={inputs.P}
                onChange={handleChange('P')}
                placeholder="계획 명세서에 대한 내용을 입력하세요..."
              />
            </div>
            <div>
              <span>T</span>
              <textarea
                value={inputs.T}
                onChange={handleChange('T')}
                placeholder="계획 명세서에 대한 내용을 입력하세요..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetroInput;