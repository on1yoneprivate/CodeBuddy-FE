import React, { useState, useEffect } from 'react';
import './RetroInput.css';
import { RiMessage3Line } from "react-icons/ri";
import { GoTriangleDown, GoTriangleUp } from "react-icons/go";

interface RetroInputProps {
  stageTitle: string;
  fetchData: () => Promise<string>; // 서버에서 데이터를 받아오는 함수
  submitData: (key: string, value: string) => void; // 서버로 데이터를 전송하는 함수
  contentClass?: string;
}

const RetroInput: React.FC<RetroInputProps> = ({ stageTitle, fetchData, submitData, contentClass }) => {
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

  const MAX_LINES = 1; // 기본적으로 보여줄 최대 줄 수 (한 줄)

    // 텍스트가 n줄을 넘어가는지 확인하는 함수
    const isTextOverflowing = (text : string) => {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.whiteSpace = 'nowrap';
    div.style.visibility = 'hidden';
    div.innerText = text;
    document.body.appendChild(div);
    const isOverflowing = div.offsetWidth > 300; // 한 줄에 해당하는 넓이 설정
    document.body.removeChild(div);
    return isOverflowing;
    };

    // 줄바꿈과 공백을 처리하는 함수
  const formatCode = (message: string) => {
    return message
      .replace(/\n/g, '<br>')        // 줄바꿈을 <br> 태그로 변환
      .replace(/ {4}/g, '&nbsp;&nbsp;&nbsp;&nbsp;')  // 공백 4칸을 &nbsp;로 변환
      .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');    // 탭 문자를 &nbsp;로 변환
  };

  return (
        <div className="retroinput-container">
            <div className="container">
                <div className="header">
                    <span className="icon"><RiMessage3Line /></span>
                    <span className="stage-title">{stageTitle}</span>
                </div>
        
                <div className={`server-data ${isOpen ? "server-data-expanded" : ""}`}>
                    <div className="server-data-text">
                        {!isOpen ? (
                        serverData && serverData.length > 50
                            ? `${serverData.substring(0, 50)}...` // 축소 상태에서 50글자 미리보기
                            : serverData || "선택된 출력값이 보여지는 공간"
                        ) : (
                            <div
                            dangerouslySetInnerHTML={{ __html: serverData }} // 줄바꿈과 공백 처리가 적용된 HTML을 렌더링
                          />
                        )}
                    </div>
    
                    <div className="toggle-button" onClick={toggleOpen}>
                        <span className="toggle-icon">
                        {isOpen ? <GoTriangleUp /> : <GoTriangleDown />}
                        </span>
                    </div>
                </div>
            </div>
    
            <div className='content'>
                <div className="user-input">
                    <div>
                        <span className="icon-with-text">
                            <RiMessage3Line />
                            Keep
                        </span>
                        <textarea
                            value={inputs.K}
                            onChange={handleChange('K')}
                            placeholder="좋았던 부분을 작성해주세요."
                            style={{ textAlign: inputs.K ? 'left' : 'center' }} /* 값이 있으면 좌측 정렬, 없으면 중앙 정렬 */
                            onFocus={(e) => e.target.style.textAlign = 'left'} /* 포커스 시 좌측 정렬 */
                            onBlur={(e) => e.target.value === '' ? e.target.style.textAlign = 'center' : null} /* 포커스가 벗어났을 때 비어 있으면 다시 중앙 정렬 */
                        />
                    </div>
                    <div>
                        <span className="icon-with-text">
                            <RiMessage3Line />
                            Problem
                        </span>
                        <textarea
                            value={inputs.P}
                            onChange={handleChange('P')}
                            placeholder="문제가 있었던 부분을 작성해주세요."
                            style={{ textAlign: inputs.P ? 'left' : 'center' }} /* 값이 있으면 좌측 정렬, 없으면 중앙 정렬 */
                            onFocus={(e) => e.target.style.textAlign = 'left'} /* 포커스 시 좌측 정렬 */
                            onBlur={(e) => e.target.value === '' ? e.target.style.textAlign = 'center' : null} /* 포커스가 벗어났을 때 비어 있으면 다시 중앙 정렬 */
                        />
                    </div>
                    <div>
                        <span className="icon-with-text">
                            <RiMessage3Line />
                            Try
                        </span>
                        <textarea
                            value={inputs.T}
                            onChange={handleChange('T')}
                            placeholder="해결 방법을 작성해주세요."
                            style={{ textAlign: inputs.T ? 'left' : 'center' }} /* 값이 있으면 좌측 정렬, 없으면 중앙 정렬 */
                            onFocus={(e) => e.target.style.textAlign = 'left'} /* 포커스 시 좌측 정렬 */
                            onBlur={(e) => e.target.value === '' ? e.target.style.textAlign = 'center' : null} /* 포커스가 벗어났을 때 비어 있으면 다시 중앙 정렬 */
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RetroInput;