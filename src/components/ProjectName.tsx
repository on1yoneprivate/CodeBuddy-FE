import React, { useEffect, useState } from 'react';
import './ProjectName.css';
import { fetchWithToken } from '../api/fetchWithToken';
import { RiQuestionAnswerFill, RiQuestionAnswerLine } from 'react-icons/ri';

interface ProjectNameProps {
  loginId: string;
  chatroomId: number;
}

const ProjectName: React.FC<ProjectNameProps> = ({ loginId, chatroomId }) => {
  const [projectName, setProjectName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProjectName = async () => {
      try {
        const response = await fetchWithToken(`/chatrooms/titles?loginId=${loginId}`, {
          method: 'GET',
        });

        const result = await response.json(); // JSON으로 파싱
        console.log('API Response:', result); // API 응답을 확인

        const data = result.data; // 응답 데이터에서 data 부분 추출

        // chatroomId에 맞는 프로젝트 이름 찾기
        const project = data[chatroomId]; // chatroomId와 일치하는 값 가져오기

        if (project) {
          setProjectName(project); // 해당 chatroomId의 프로젝트 이름 설정
        } else {
          setProjectName('알 수 없는 프로젝트');
        }

        setLoading(false);
      } catch (error) {
        console.error('프로젝트 이름을 가져오는 중 오류 발생:', error);
        setProjectName('프로젝트 이름을 불러올 수 없습니다.');
        setLoading(false);
      }
    };

    fetchProjectName();
  }, [loginId, chatroomId]); // loginId와 chatroomId가 변경될 때마다 실행

  return (
    <div className="project-name-container">
      <div className="icon"><RiQuestionAnswerLine /></div> {/* 이모지 또는 이미지 */}
      <div className="text">
        {loading ? '로딩 중...' : (projectName || '프로젝트 이름을 불러올 수 없습니다.')}
      </div>
    </div>
  );
};

export default ProjectName;
