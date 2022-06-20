import {execSync} from 'child_process';
import {Node} from 'svg-parser';
const options = {stdio:[0, 1, 2]};

export const bash = (cmd: string) => {
    execSync(cmd, options);
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
export const remarkSVGPaths = (svgNode: Array<Node | string>, isMultiColor = true): string[] => {
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
                    properties.push(`d="${row.properties.d}"`);
                }
                curr.push(`    <path ${properties.join(' ')}/>`);
                return curr;
            }else if(row.children && row.children.length > 0){
                return remarkSVGPaths(row.children, isMultiColor);
            }
        }
        return curr;
    }, []);
}