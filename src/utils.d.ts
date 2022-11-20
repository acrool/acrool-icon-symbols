import { Node } from 'svg-parser';
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
export declare const decodeSvgPath: (svgContent: string) => string[];


export declare const decodeSvgPath2: (svgContent: string) => Array<{
    viewBox?: string,
    paths?: string[],
}>;