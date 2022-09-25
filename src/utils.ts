import path from 'path';
import {Node, parse} from 'svg-parser';
import {regPattern} from 'bear-jsutils/equal';



/**
 * 保留小數第二位
 * @returns {string}
 * @param num
 */
export const numToDecimal2 = (num: number): number => {
    const f = Math.floor(num * 100) / 100;
    let s = f.toString();
    let rs = s.indexOf('.');
    if (rs < 0) {
        rs = s.length;
        s += '.';
    }
    while (s.length <= rs + 2) {
        s += '0';
    }
    return Number(s);
};


const onlyUnique = (value: string, index: number, self: string[]): boolean => {
    return self.indexOf(value) === index;
};

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
 * get svg paths
 * @param svgNode
 */
export const checkIsSVGMultiColor = (svgNode: Array<Node | string>): boolean => {
    const fillColors = getMultiColor(svgNode);
    const colorLength = fillColors.filter(onlyUnique).length;
    return colorLength > 1;
};




/**
 * get svg paths
 * @param svgNode
 * @param isMultiColor
 */
export const remarkDeepSVGPaths = (svgNode: Array<Node | string>, isMultiColor = true): string[] => {
    return svgNode.reduce((curr: string[], row) => {
        if(typeof row !== 'string' && row.type === 'element'){
            if(row.tagName === 'path'){
                const properties = [];
                if(isMultiColor) {
                    if (row.properties?.['fill-opacity']) {
                        properties.push(`fill-opacity="${row.properties?.['fill-opacity'].toString().replace('0.','.')}"`);
                    }
                    if (row.properties?.fill) {
                        properties.push(`fill="${row.properties.fill.toLocaleString()}"`);
                    }
                }
                if(row.properties?.d){
                    const d = row.properties.d
                        .toString()
                        .replace('\n','')
                        .replace('\t','')
                    ;
                    properties.push(`d="${d}"`);
                }
                curr.push(`    <path ${properties.join(' ')}/>`);
                return curr;
            }else if(row.children && row.children.length > 0){
                return remarkDeepSVGPaths(row.children, isMultiColor);
            }
        }
        return curr;
    }, []);
}


/**
 * 解析SVGPath
 * @param svgContent
 */
export const decodeSvgPath = (svgContent: string): string[] => {

    const reg = new RegExp(regPattern.svg);
    const svgTag = reg.exec(svgContent);

    if(svgTag && svgTag.length > 0){
        const result = svgTag[0];
        const svgString = parse(result);

        // diff svgPaths
        const isMultiColor = checkIsSVGMultiColor(svgString.children);
        return remarkDeepSVGPaths(svgString.children, isMultiColor);
    }

    return [];
};


