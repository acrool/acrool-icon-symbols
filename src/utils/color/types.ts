/**
 * SVG 節點型別定義
 */
export type SVGNode = {
    type: string;
    tagName?: string;
    properties?: {
        fill?: string;
        'fill-opacity'?: string | number;
        [key: string]: any;
    };
    children?: Array<SVGNode | string>;
};
