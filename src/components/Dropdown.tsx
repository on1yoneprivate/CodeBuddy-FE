import React, { useState } from 'react';
import './Dropdown.css';

interface DropdownOption {
  label: string;
  value: string;
}

const Dropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(null);

  const options: DropdownOption[] = [
    { label: '계획 설계', value: 'plan' },
    { label: '설계도 생성', value: 'design' },
    { label: '코드 생성', value: 'code' },
    { label: '회고', value: 'retrospective' },
  ];

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (option: DropdownOption) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  return (
    <div className="dropdown">
      <button onClick={toggleDropdown} className="dropdown-toggle">
        {selectedOption ? selectedOption.label : '계획 설계'}
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
