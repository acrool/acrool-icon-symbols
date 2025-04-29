import {Node} from 'svg-parser';
import {isNotEmpty} from '@acrool/js-utils/equal';

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
const getMultiColor = (svgNode: Array<Node | string>): string[] => {
    return svgNode.reduce((curr: string[], row) => {
        if(typeof row !== 'string' && row.type === 'element'){
            if(row.tagName === 'path'){
                const colors = [];
                if(row.properties?.fill){
                    colors.push(row.properties.fill.toLocaleString());
                }

                if(row.properties?.['fill-opacity']){
                    colors.push(row.properties?.['fill-opacity'].toString().replace('0.','.'));
                }

                curr.push(colors.join('_'));
                return curr;
            }else if(row.children && row.children.length > 0){
                return getMultiColor(row.children);
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
export const checkIsSVGMultiColor = (svgNode: Array<Node | string>): boolean => {
    const fillColors = getMultiColor(svgNode);
    const colorLength = fillColors.filter(onlyUnique).length;
    return colorLength > 1;
}; 