import React, { createContext, useState, useContext, ReactNode } from 'react';
import { QuestionTitle } from '../types/ChatroomProps';

// SidebarContext의 타입을 정의합니다.
interface SidebarContextType {
  sidebarData: QuestionTitle[];
  setSidebarData: React.Dispatch<React.SetStateAction<QuestionTitle[]>>;
}

// 기본값을 설정하여 SidebarContext를 생성합니다.
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// SidebarProvider의 props 타입 정의 (children 포함)
interface SidebarProviderProps {
  children: ReactNode;
}

// Context를 제공하는 컴포넌트를 생성합니다.
export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const [sidebarData, setSidebarData] = useState<QuestionTitle[]>([]);

  return (
    <SidebarContext.Provider value={{ sidebarData, setSidebarData }}>
      {children}
    </SidebarContext.Provider>
  );
};

// SidebarContext를 사용하는 훅을 정의합니다.
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
