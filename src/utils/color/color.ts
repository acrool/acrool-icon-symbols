import {removeLeadingZero} from '@acrool/js-utils/number';

import {SVGNode} from './types';

/**
 * 检查数组中元素是否唯一
 * @param value - 当前元素值
 * @param index - 当前元素索引
 * @param self - 原数组
 * @returns 如果元素在数组中第一次出现则返回 true，否则返回 false
 */
const onlyUnique = (value: string, index: number, self: string[]): boolean => {
    return self.indexOf(value) === index;
};

/**
 * 递归获取 SVG 节点中的所有颜色信息
 * @param svgNode - SVG 节点数组
 * @returns 包含所有颜色信息的数组，格式为 "颜色_透明度"
 */
const getMultiColor = (svgNode: Array<SVGNode | string>): string[] => {
    return svgNode.reduce((curr: string[], row) => {
        if (typeof row !== 'string' && row.type === 'element') {
            if (row.tagName === 'path') {
                const colors = [];
                if (row.properties?.fill) {
                    colors.push(row.properties.fill.toString());
                }
                if (row.properties?.['fill-opacity']) {
                    colors.push(removeLeadingZero(row.properties['fill-opacity'].toString()));
                }
                curr.push(colors.join('_'));
            }
            // 遞迴收集所有子節點的 path 顏色
            if (row.children && row.children.length > 0) {
                curr.push(...getMultiColor(row.children));
            }
        }
        return curr;
    }, []);
};

/**
 * 检查 SVG 是否包含多种颜色
 * @param svgNode - SVG 节点数组
 * @returns 如果 SVG 包含多种颜色则返回 true，否则返回 false
 */
export const checkIsSVGMultiColor = (svgNode: Array<SVGNode | string>): boolean => {
    const fillColors = getMultiColor(svgNode);
    const colorLength = fillColors.filter(onlyUnique).length;
    return colorLength > 1;
};
