import {removeLeadingZero} from '@acrool/js-utils/number';

interface SVGNode {
    '#name'?: string;
    tagName?: string;
    properties?: Record<string, any>;
    children?: SVGNode[];
}

/**
 * 处理 SVG 元素的属性
 * @param properties - 属性对象
 * @param isMultiColor - 是否为多色图标
 * @returns 格式化后的属性字符串数组
 */
export const formatSvgProperties = (properties: Record<string, any>, isMultiColor: boolean): string[] => {
    const result: string[] = [];
    if (isMultiColor) {
        if (properties['fill-opacity']) {
            const opacity = removeLeadingZero(properties['fill-opacity'].toString());
            result.push(`fill-opacity="${opacity}"`);
        }
        if (properties.fill) {
            result.push(`fill="${properties.fill.toLocaleString()}"`);
        }
        if (properties.stroke) {
            result.push(`stroke="${properties.stroke}"`);
        }
    } else {
        if (properties.stroke) {
            result.push('stroke="currentColor"');
        }
    }
    return result;
};

/**
 * 递归处理 SVG 路径，生成路径字符串数组
 * @param svgNode - SVG 节点数组
 * @param isMultiColor - 是否处理多色情况，默认为 true
 * @returns 包含所有路径字符串的数组
 */
export const remarkDeepSVGPaths = (svgNode: SVGNode[], isMultiColor = true): string[] => {
    return svgNode.reduce((curr: string[], row) => {
        if (row && (row['#name'] === 'path' || row.tagName === 'path')) {
            const properties = formatSvgProperties(row.properties || {}, isMultiColor);
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
