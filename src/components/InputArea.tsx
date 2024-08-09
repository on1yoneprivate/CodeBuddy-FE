import React, { useState } from 'react';

interface InputAreaProps {
  onSend: (message: string) => void;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend }) => {
  const [inputText, setInputText] = useState<string>('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  };

  const handleSend = () => {
    onSend(inputText);
    setInputText(''); // 입력창을 비웁니다.
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div>
      <input
        type="text"
        value={inputText}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="메시지를 입력하세요"
      />
      <button onClick={handleSend}>전송</button>
    </div>
  );
}

export default InputArea;
