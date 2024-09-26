import React, { useEffect, useRef } from 'react';
import './Dropdown.css';

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  options: DropdownOption[];  // 옵션 배열 타입 지정
  selected: string | null;    // 선택된 값 (선택하지 않았을 때 null)
  onChange: (value: string) => void;  // 값이 변경될 때 호출되는 함수
  isOpen: boolean;            // 부모로부터 드롭다운의 열림/닫힘 상태를 받음
  setIsOpen: (open: boolean) => void; // 부모로부터 열림/닫힘 상태를 변경하는 함수
}

const Dropdown: React.FC<DropdownProps> = ({ options, selected, onChange, isOpen, setIsOpen }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleOptionClick = (option: DropdownOption) => {
    onChange(option.value);  // 부모 컴포넌트에 선택된 값 전달
    setIsOpen(false);        // 드롭다운 닫기
  };

  // 외부 클릭 감지 핸들러
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false); // 외부 클릭 시 드롭다운 닫기
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsOpen]);

  return (
    <div className="dropdown" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="dropdown-toggle">
        {selected ? options.find(option => option.value === selected)?.label : 'Select an option'}
        <span className="arrow">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <ul className="dropdown-menu">
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => handleOptionClick(option)}
              className="dropdown-item"
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;