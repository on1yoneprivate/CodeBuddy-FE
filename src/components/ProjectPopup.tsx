import React, { useState } from 'react';
import styled from 'styled-components';

const PopupContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  padding: 20px;
  width: 400px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const InputField = styled.input`
  width: 70%;
  border: none;
  border-bottom: 1px solid #ddd;
  padding: 10px;
  font-size: 16px;
  outline: none;
`;

const AddButton = styled.button<{ active: boolean }>`
  background-color: ${({ active }) => (active ? '#0085FF' : '#e0f0ff')};
  color: ${({ active }) => (active ? 'white' : '#000')};
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  cursor: ${({ active }) => (active ? 'pointer' : 'not-allowed')};
  transition: background-color 0.3s ease;
`;

const PlusButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 24px;
  position: fixed;
  bottom: 20px;
  right: 20px;
`;

const ProjectPopup = () => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [projectName, setProjectName] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(e.target.value);
  };

  const handlePopupOpen = () => {
    setIsPopupVisible(true);
  };

  const handlePopupClose = () => {
    setIsPopupVisible(false);
  };

  return (
    <>
      {/* Plus 버튼 */}
      <PlusButton onClick={handlePopupOpen}>+</PlusButton>

      {/* 팝업 창 */}
      {isPopupVisible && (
        <PopupContainer>
          <InputField
            type="text"
            placeholder="생성할 프로젝트의 이름을 입력해 주세요."
            value={projectName}
            onChange={handleInputChange}
          />
          <AddButton
            active={projectName.trim().length > 0}
            onClick={() => {
              if (projectName.trim()) {
                alert(`프로젝트 ${projectName}가 추가되었습니다!`);
                handlePopupClose();
              }
            }}
            disabled={projectName.trim().length === 0}
          >
            추가하기
          </AddButton>
        </PopupContainer>
      )}
    </>
  );
};

export default ProjectPopup;