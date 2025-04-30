import {removeLeadingZero} from '@acrool/js-utils/number';

interface SVGNode {
    '#name'?: string;
    tagName?: string;
    properties?: Record<string, any>;
    children?: SVGNode[];
}


/**
 * 递归处理 SVG 路径，生成路径字符串数组
 * @param svgNode - SVG 节点数组
 * @param isMultiColor - 是否处理多色情况，默认为 true
 * @returns 包含所有路径字符串的数组
 */
export const remarkDeepSVGPaths = (svgNode: SVGNode[], isMultiColor = true): string[] => {
    return svgNode.reduce((curr: string[], row) => {
        if (row && (row['#name'] === 'path' || row.tagName === 'path')) {
            const properties = [];
            if (isMultiColor) {
                if (row.properties?.['fill-opacity']) {
                    const opacity = removeLeadingZero(row.properties['fill-opacity'].toString());
                    properties.push(`fill-opacity="${opacity}"`);
                }
                if (row.properties?.fill) {
                    properties.push(`fill="${row.properties.fill.toLocaleString()}"`);
                }
            }
            if (row.properties?.d) {
                const d = row.properties.d
                    .toString()
                    .replace(/\n/g, '')
                    .replace(/\t/g, '');
                properties.push(`d="${d}"`);
            }
            curr.push(`<path ${properties.join(' ')}/>`);
            return curr;
        } else if (row.children && row.children.length > 0) {
            return remarkDeepSVGPaths(row.children, isMultiColor);
        }
        return curr;
    }, []);
};
