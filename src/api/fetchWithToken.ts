// src/api/fetchWithToken.ts
import { reissueToken } from './tokenService';

export const fetchWithToken = async (url: string, options: RequestInit): Promise<Response> => {
  let token = localStorage.getItem('accessToken');

  if (!token) {
    token = await reissueToken();
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    // 토큰이 만료된 경우
    try {
      token = await reissueToken();
      const retryResponse = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });
      return retryResponse;
    } catch (error) {
      console.error('Failed to reissue token:', error);
      throw error;
    }
  }
  return response;
};
