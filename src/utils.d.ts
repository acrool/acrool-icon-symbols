import {Node} from 'svg-parser';



export declare interface IAttr{
    d?: string,
    fill?: string,
    fillOpacity?: string,
    fillRule?: string,
    clipRule?: string,
}


export declare const getFilesizeInBytes: (filename: string) => string;
/**
 * get svg paths
 * @param svgNode
 */
export declare const checkIsSVGMultiColor: (svgNode: Array<Node | string>) => boolean;
/**
 * get svg paths
 * @param svgNode
 * @param isMultiColor
 */
export declare const remarkDeepSVGPaths: (svgNode: Array<Node | string>, isMultiColor?: boolean) => string[];


/**
 * 解析SVGPath
 * @param svgContent
 */
export declare const formatSvgPaths: (svgContent: string) => {
    viewBox?: string,
    paths?: string[],
};

/**
 * 解析SymbolsContent
 */
export declare const decodeSymbols: (symbolsContent: string) => Array<{
    code: string,
    viewBox: string,
    content: string,
}>;


/**
 * 解析SVG 的Path
 * (如果只有 <path .../><path .../> 則自行用 <svg>{paths}</svg> 包裝起來)
 */
export declare const decodeSvgPaths: (symbolsContent: string) => {
    fillDiffColor: string[],
    viewBox?: string,
    paths: IAttr[],
};

