

export interface ISvgAttributes {
    // 通用屬性
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

    // 多邊形和路徑
    points?: string | null;
    d?: string | null;
}



export type TFormatSvgContent = (svgContent: string) => {
    viewBox?: string,
    content?: string[],
}
export type TDecodeSymbols = (symbolsContent: string) => Array<{
    viewBox?: string,
    code: string,
    content: string,
}>

type TTagKey = 'g'|'rect'|'ellipse'|'path'|'circle'|'step'

export type TDecodeSvgContent = (svgContent: string) => {
    viewBox?: string,
    fillDiffColor: string[],

    content: Record<TTagKey, ISvgAttributes[]>,
}
