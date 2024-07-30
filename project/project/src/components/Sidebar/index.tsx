import { useCookies } from "react-cookie";
import { Link } from 'react-router-dom';
import styled from "styled-components";
import "./sidebar.css";

import PALETTE from "../../constants/palettes";
import OptionItem from "./OptionItem";
import OptionList from "./OptionList";
import { MenuOption, Option } from "../../types";


export type SidebarProps = {
    onSidebarOpen: (isOpen: boolean) => void;
    isOpen: boolean;
};

const StyledUserName = styled.div`
    border-bottom : 1px solid ${PALETTE.BLACK};
`;

const StyledLogin = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;
    border-radius: 4px;
    font-family: 'Pretendard-semiBold';
    background: ${PALETTE.PRI_LIGHT_010};
`;

const Sidebar = ({ onSidebarOpen, isOpen}: SidebarProps) => {
    const [cookies, setCookie, removeCookie] = useCookies([
        'AccessToken',
        'RefreshToken',
        'UserInfo',
    ]);

    const userName = cookies.AccessToken
        ? cookies['UserInfo']['last_name'] + cookies['UserInfo']['first_name']
        : null;

    const userSetting: Option[] = [
        {
            userName: `${userName}`,
            optionName: ' 님',
            link: userName  ? '/mypage': '/login',
            fontSize: '1rem',
            fontFamily: 'Pretendard-Bold',
            isShownAlways: true,
        },
    ];

    const menuOption: MenuOption[] = [
        {
            optionName: '계획 설계',
            link: '/plan',
            fontSize: '1rem',
            fontFamily: 'Pretendard-Bold',
            underlineHeight: '2px',
            fontColor: PALETTE.DARK_030,
            isShownAlways: true,
        },
        {
            optionName: '설계도 생성',
            link: '/blueprint',
            fontSize: '1rem',
            fontFamily: 'Pretendard-Bold',
            underlineHeight: '2px',
        },
        {
            optionName: '코드 구현',
            link: '/code',
            fontSize: '1rem',
            fontFamily: 'Pretendard-Bold',
            underlineHeight: '2px',
            fontColor: PALETTE.DARK_030,
            isShownAlways: true,
        },
        {
            optionName: '테스트 코드',
            link: '/testcode',
            fontSize: '1rem',
            fontFamily: 'Pretendard-Bold',
            underlineHeight: '2px',
            fontColor: PALETTE.DARK_030,
            isShownAlways: true,
        },
        {
            optionName: '버전 관리',
            link: '/version',
            fontSize: '1rem',
            fontFamily: 'Pretendard-Bold',
            underlineHeight: '2px',
            fontColor: PALETTE.DARK_030,
            isShownAlways: true,
        }
    ];

    const connection: Option[] = [
        {
          optionName: '로그아웃',
          link: '/',
          fontSize: '1rem',
          underlineHeight: '2px',
          onClick: () => {
            removeCookie('AccessToken');
            removeCookie('RefreshToken');
            removeCookie('UserInfo');
            onSidebarOpen(false);
          },
        },
    ];
    
    return (
        <OptionList onSidebarOpen={onSidebarOpen} isOpen={isOpen}>
            {userSetting.concat(menuOption).map((option, index) => (
                <Link key={`${option.optionName}-${option.link}`} to={option.link}>
                    <OptionItem
                        fontSize={option.fontSize}
                        fontFamily={option.fontFamily}
                        fontColor={PALETTE.DARK_030}
                        underlineHeight={option.underlineHeight}
                        direction={option.direction}
                        disabled={option.disabled}
                        isShownAlways={option.isShownAlways}
                    >
                        {index === 0 && userName && (
                            <>
                                <StyledUserName>{option.userName}</StyledUserName>
                                {option.optionName}
                            </>
                        )}
                        {index === 0 && !userName && <StyledLogin>로그인</StyledLogin>}
                    </OptionItem>
                </Link>
            ))}

            {connection.map((option) => (
                <Link key={`${option.optionName}-${option.link}`} to={option.link}>
                    <OptionItem
                        fontSize={option.fontSize}
                        fontFamily={option.fontFamily}
                        fontColor={PALETTE.DARK_030}
                        underlineHeight={option.underlineHeight}
                        direction={option.direction}
                        disabled={option.disabled}
                        onClick={option.onClick}
                        isShownAlways={option.isShownAlways}
                    >
                        {option.optionName}
                    </OptionItem>
                </Link>
            ))}
        </OptionList>
    );
};

export default Sidebar;