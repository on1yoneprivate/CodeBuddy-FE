import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { fetchWithToken } from '../api/fetchWithToken';
import { useNavigate } from 'react-router-dom';

const apiUrl = `/chatrooms`;

const PopupContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  padding: 20px;
  width: 500px;
  height: 70px;
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

const AddButton = styled.button<{ active?: boolean }>`
  background-color: ${({ active }) => (active ? '#0085FF' : '#e0f0ff')};
  color: ${({ active }) => (active ? 'white' : '#000')};
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  cursor: ${({ active }) => (active ? 'pointer' : 'not-allowed')};
  transition: background-color 0.3s ease;
`;

const ProjectPopup = ({
  isPopupVisible,
  onClose,
  onAddProject,
}: {
  isPopupVisible: boolean;
  onClose: () => void;
  onAddProject: (chatroomId: number, projectName: string) => void;
}) => {
  const [projectName, setProjectName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Error message state
  const popupRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(e.target.value);
    setErrorMessage(null); // Clear error message when typing
  }, []);

  const handleAddProject = useCallback(async () => {
    if (projectName.trim()) {
      try {
        const requestData = { title: projectName };
        const response = await fetchWithToken(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        if (response.status === 201) {
          const responseData = await response.json();
          const chatroomId = responseData.data.id;
          const chatroomTitle = responseData.data.title;

          onAddProject(chatroomId, chatroomTitle); // 부모 컴포넌트에 chatroomId와 title 전달
          setProjectName(''); // 입력 필드 초기화
          onClose(); // 팝업 닫기

          navigate(`/project/${chatroomId}`);
        } else {
          setErrorMessage('Failed to create chatroom. Please try again.');
          console.error('Failed to create chatroom');
        }
      } catch (error) {
        setErrorMessage('Error while creating chatroom. Please check your connection.');
        console.error('Error while creating chatroom:', error);
      }
    }
  }, [projectName, onAddProject, navigate, onClose]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
      onClose();
    }
  }, [onClose]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Enter' && projectName.trim().length > 0) {
      handleAddProject();
    }
  }, [projectName, handleAddProject]);

  useEffect(() => {
    if (isPopupVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown); // Listen for Enter key
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPopupVisible, projectName, handleClickOutside, handleKeyDown]);

  if (!isPopupVisible) {
    return null;
  }

  return (
    <PopupContainer ref={popupRef}>
      <InputField
        type="text"
        placeholder="프로젝트 이름을 입력하세요"
        value={projectName}
        onChange={handleInputChange}
      />
      <AddButton
        active={projectName.trim().length > 0 ? true : undefined}
        onClick={handleAddProject}
        disabled={projectName.trim().length === 0}
      >
        추가하기
      </AddButton>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>} {/* Display error message */}
    </PopupContainer>
  );
};

export default ProjectPopup;