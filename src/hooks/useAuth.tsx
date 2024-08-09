import { useState, useEffect } from 'react';

const useAuth = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        // 여기에 로그인된 사용자의 ID를 가져오는 로직을 추가하세요
        // 예를 들어, API 호출을 통해 사용자의 정보를 가져올 수 있습니다.
        const storedUserId = localStorage.getItem('loginId');
        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    fetchUserId();
  }, []);

  return userId;
};

export default useAuth;