import * as fs from 'fs';
import path from 'path';
import logger from '../script/logger';
import {parse, Node} from 'svg-parser';
import {bash} from '../script/utils';

interface IArgs {
    path: string,
    idPrefix?: string
}

const svgTagRule = /<svg\b[^>]*?(?:viewBox=\"(\b[^"]*)\")?>([\s\S]*?)<\/svg>/g;

function remarkSVGPaths(svgNode: Array<Node | string>): any{
    return svgNode.reduce((curr: string[], row) => {
        if(typeof row !== 'string' && row.type === 'element'){
            if(row.tagName === 'path'){
                const properties = [];
                if(row.properties?.fill){
                    properties.push(`fill="${row.properties?.fill}"`);
                }
                if(row.properties?.d){
                    properties.push(`d="${row.properties?.d}"`);
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

/**
 * reg: https://regex101.com/r/ai3qvO/1
 * run test: ts-node lib/svg-symbols/index.ts
 * @param args
 */
async function run(args: IArgs) {
    const basePath = typeof args.path !== 'undefined' ? args.path: './';
    const sourceDirPath = path.join(basePath, '_sources');
    const idPrefix = typeof args.idPrefix !== 'undefined' ? args.idPrefix: 'icon';

    logger.info(`svg merge symbols ${basePath} ...`);

    const symbol: string[] = [];
    const iconCodes: string[] = [];

    const dirChildFiles = fs.readdirSync(sourceDirPath);

    const targetSvgFile = path.join(basePath, 'index.svg');
    const targetTypeFile = path.join(basePath, 'icon.d.ts');

    dirChildFiles.forEach(file => {
        if (path.extname(file) == '.svg'){
            const filename = file.replace('.svg', '');
            const iconCode = [idPrefix, filename].join('-');

            const svgFile = fs.readFileSync(path.join(basePath, file), {encoding:'utf8', flag:'r'});

            const svgContent = svgFile.toString();
            const reg = new RegExp(svgTagRule);
            const svgTag = reg.exec(svgContent);

            if(svgTag && svgTag.length > 0){
                const result = svgTag[0];
                const svgString = parse(result);
                const svgPaths = remarkSVGPaths(svgString.children);
                symbol.push(`  <symbol id="${iconCode}" viewBox="0 0 1024 1024">\n${svgPaths.join('\n')}\n  </symbol>`);
                iconCodes.push(`'${filename}'`);

                logger.success(`${file}`);
            }else{
                logger.error(`${file} --> not find svg tag`);
            }



        }

    });

    // write file
    fs.writeFileSync(targetSvgFile, `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">\n
${symbol.join('\n\n')}\n
</svg>`);
    fs.writeFileSync(targetTypeFile, `declare type IconCode = ${iconCodes.join('|')};`);


    // By OSX Notice
    bash(`osascript -e 'display notification "${basePath} done" with title "publish done"'`);
}

// run({path: './example/svg-symbols/_source'});
export default run;
module.exports = run;