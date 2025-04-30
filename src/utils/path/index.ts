import {Node} from 'svg-parser';
import {removeLeadingZero} from '../common';

/**
 * 递归处理 SVG 路径，生成路径字符串数组
 * @param svgNode - SVG 节点数组
 * @param isMultiColor - 是否处理多色情况，默认为 true
 * @returns 包含所有路径字符串的数组
 */
export const remarkDeepSVGPaths = (svgNode: Array<Node | string>, isMultiColor = true): string[] => {
    return svgNode.reduce((curr: string[], row) => {
        if(typeof row !== 'string' && row.type === 'element'){
            if(row.tagName === 'path'){
                const properties = [];
                if(isMultiColor) {
                    if (row.properties?.['fill-opacity']) {
                        properties.push(`fill-opacity="${removeLeadingZero(row.properties?.['fill-opacity'].toString())}"`);
                    }
                    if (row.properties?.fill) {
                        properties.push(`fill="${row.properties.fill.toLocaleString()}"`);
                    }
                }
                if(row.properties?.d){
                    const d = row.properties.d
                        .toString()
                        .replace(/\n/g,'')
                        .replace(/\t/g, '')
                    ;
                    properties.push(`d="${d}"`);
                }
                curr.push(`<path ${properties.join(' ')}/>`);
                return curr;
            }else if(row.children && row.children.length > 0){
                return remarkDeepSVGPaths(row.children, isMultiColor);
            }
        }
        return curr;
    }, []);
}; 