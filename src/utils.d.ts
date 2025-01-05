import {Node} from 'svg-parser';
import {
    lowerCaseToLowerDashCase,
    removeStartEnd,
    removeUndefinedValues
} from '@acrool/js-utils/string';
import {
    ISvgAttributes,
    TDecodeSvgContent,
    TDecodeSymbols,
    TFormatSvgContent
} from './types';


export type extractIdFromUrl = (input: string) => string | null;
export type extractId = (input: string) => string | null;
export type getAttr = (el: cheerio.Cheerio) => ISvgAttributes;
export type checkIsSVGMultiColor = (svgNode: Array<Node | string>) => boolean;
export type remarkDeepSVGPaths = (svgNode: Array<Node | string>, isMultiColor?: boolean) => string[]


export type formatSvgContent = TFormatSvgContent;
export type decodeSymbols = TDecodeSymbols;
export type decodeSvgContent = TDecodeSvgContent;
