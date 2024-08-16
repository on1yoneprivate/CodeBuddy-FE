// src/api/tokenService.ts
export const reissueToken = async () => {
    const loginId = localStorage.getItem('loginId');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!loginId || !refreshToken) {
      throw new Error('No loginId or refreshToken found');
    }
  
    const response = await fetch('/users/reissue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ loginId, refreshToken }),
    });
  
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      return data.data.accessToken;
    } else {
      const responseData = await response.json();
      throw new Error(responseData.message || 'Failed to reissue token');
    }
  };
  