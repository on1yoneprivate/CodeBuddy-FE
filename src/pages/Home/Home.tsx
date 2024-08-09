import React, { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";

const Home: React.FC = (): ReactElement => {
    const navigate = useNavigate();

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    return (
        <div className="button-container">
            <div className='button-row'>
                <div className="button" onClick={() => handleNavigation('/plan')}>계획 설계</div>
                <div className="button" onClick={() => handleNavigation('/design')}>설계도 생성</div>
                <div className="button" onClick={() => handleNavigation('/code')}>코드 구현</div>
            </div>
            <div className="button-row">
                <div className="button" onClick={() => handleNavigation('/testcode')}>테스트 코드</div>
                <div className="button" onClick={() => handleNavigation('/version')}>버전 관리</div>
            </div>
        </div>
    );
};

export default Home;
