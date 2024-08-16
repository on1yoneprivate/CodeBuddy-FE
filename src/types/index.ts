import React from 'react';

export type ArrowDirection = 'right' | 'down' | 'up';

export type OptionDecoration = {
    readonly fontSize? : string;
    readonly fontFamily? : string;
    readonly fontColor? : string;
    readonly underlineHeight?: string;
    readonly isUseBoldUnderline? : boolean;
    readonly direction? : ArrowDirection | null;
    readonly disabled? : boolean;
};

export type Option = {
    readonly userName? : string;
    readonly optionName : string;
    readonly link: string;
    readonly isShownAlways? : boolean;
    onClick? : React.MouseEventHandler<HTMLButtonElement>;
} & OptionDecoration;

export type GenericOption<T> = {
    readonly userName? : string;
    readonly optionName : string;
    readonly link: string;
    readonly isShownAlways? : boolean;
    onClick? : React.MouseEventHandler<T>;  // 제네릭 타입을 사용하여 유연하게 처리
} & OptionDecoration;

export type MenuOption = {
    readonly optionName: string;
    readonly link : string;
    readonly isShownAlways? : boolean;
    readonly onClick? : React.MouseEventHandler<HTMLButtonElement>;
} & OptionDecoration;

export type Children = React.ReactNode;

export type DivOption = GenericOption<HTMLDivElement>;
export type ButtonOption = GenericOption<HTMLButtonElement>;