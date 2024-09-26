import React from 'react';

interface CheckboxProps {
  checked: boolean; // 체크박스의 상태 (true/false)
  onChange: (checked: boolean) => void; // 체크박스 상태가 변경될 때 호출되는 함수
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked); // 체크박스가 변경될 때 상태를 업데이트
  };

  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={handleChange}
      style={{ width: '20px', height: '20px', marginLeft: '3px' }} // 스타일은 필요에 따라 수정 가능
    />
  );
};

export default Checkbox;