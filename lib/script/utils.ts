import {execSync} from 'child_process';
import {Node} from 'svg-parser';
const options = {stdio:[0, 1, 2]};

export const bash = (cmd: string) => {
    execSync(cmd, options);
};


/**
 * get svg paths
 * @param svgNode
 */
export const remarkSVGPaths = (svgNode: Array<Node | string>): string[] => {
    return svgNode.reduce((curr: string[], row) => {
        if(typeof row !== 'string' && row.type === 'element'){
            if(row.tagName === 'path'){
                const properties = [];
                if(row.properties?.['fill-opacity']){
                    properties.push(`fill-opacity="${row.properties?.['fill-opacity']}"`);
                }
                if(row.properties?.fill){
                    properties.push(`fill="${row.properties.fill}"`);
                }
                if(row.properties?.d){
                    properties.push(`d="${row.properties.d}"`);
                }
                curr.push(`    <path ${properties.join(' ')}/>`);
                return curr;
            }else if(row.children && row.children.length > 0){
                return remarkSVGPaths(row.children);
            }
        }
        return curr;
    }, []);
}