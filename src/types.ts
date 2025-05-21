
export interface ISvgAttributes {
    // 通用屬性
    id?: string | null;
    style?: string | null;
    transform?: string | null;
    visibility?: string | null;
    display?: string | null;
    opacity?: string | null;

    // 填充相關屬性
    fill?: string | null;
    fillOpacity?: string | null;
    fillRule?: string | null;

    // 剪裁相關屬性
    clipRule?: string | null;
    clipPath?: string | null;

    // 漸層相關
    gradientUnits?: string,

    // 描邊相關屬性
    stroke?: string | null;
    strokeWidth?: string | null;
    strokeOpacity?: string | null;
    strokeLinecap?: string | null;
    strokeLinejoin?: string | null;
    strokeDasharray?: string | null;
    strokeDashoffset?: string | null;

    // 幾何屬性
    x?: string | null;
    y?: string | null;
    width?: string | null;
    height?: string | null;
    cx?: string | null;
    cy?: string | null;
    r?: string | null;
    rx?: string | null;
    ry?: string | null;
    x1?: string | null;
    y1?: string | null;
    x2?: string | null;
    y2?: string | null;

    offset?: string | null;
    'stop-color'?: string | null;

    // 多邊形和路徑
    points?: string | null;
    d?: string | null;
}


export interface IFormatSvgContentRes {
    viewBox?: string,
    content?: string[],
    defs?: string[],
}

// export type TFormatSvgContent = (svgContent: string) => IFormatSvgContentRes




export interface IDecodeSymbolsRes {
    viewBox?: string,
    code: string,
    content: string,
}
export type TDecodeSymbols = (symbolsContent: string) => IDecodeSymbolsRes[]

export type TTagKey = 'g'|'rect'|'ellipse'|'path'|'circle'|'stop'

export interface IDef {
    tag: string,
    attr: ISvgAttributes,
    children?: Array<{
        tag: string,
        attr: ISvgAttributes,
    }>,
}


export interface IDecodeSvgContentRes {
    viewBox?: string,
    fillDiffColor: string[],
    fillNone: boolean,
    content: IDef[],
    defs: IDef[],
}

