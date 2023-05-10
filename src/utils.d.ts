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
 */
export declare const decodeSvgPath: (svgContent: string) => Array<{
    code: string,
    viewBox: string,
    content: string,
}>;
