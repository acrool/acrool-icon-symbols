import * as fs from 'fs';
import path from 'path';
import logger from '../script/logger';
import {parse, Node} from 'svg-parser';
import {bash, remarkSVGPaths} from '../script/utils';
import {regRules} from '../config';

interface IArgs {
    path: string,
    idPrefix?: string
}




/**
 * decode iconfont.js to _sources/svgs
 * reg: https://regex101.com/r/ai3qvO/1
 * run test: ts-node lib/decode-iconfont/index.ts
 * @param args
 */
async function run(args: IArgs) {
    const basePath = typeof args.path !== 'undefined' ? args.path: './';
    const sourceDirPath = path.join(basePath, '_sources');
    const idPrefix = 'icon-';



    logger.info(`iconfont decode svgs ${basePath} ...`);

    const symbol: string[] = [];
    const iconCodes: string[] = [];


    const iconfontJsFile = path.join(basePath, 'iconfont.js');
    const jsContent = fs
        .readFileSync(iconfontJsFile, {encoding:'utf8', flag:'r'})
        .toString();

    const svgReg = new RegExp(regRules.svg);
    const svgTags = svgReg.exec(jsContent);
    if(svgTags && svgTags.length > 0){
        const symbolTags = svgTags[0].match(regRules.symbol);

        if(symbolTags && symbolTags.length > 0) {
            // const result = symbolTags[0];
            symbolTags.forEach(symbolStr => {

                const svgString = parse(symbolStr);
                const svgPaths = remarkSVGPaths(svgString.children);

                const idRes = regRules.id.exec(symbolStr);
                if(idRes && idRes.length > 1){
                    const filename = `${idRes[1].replace('icon-','')}.svg`;
                    const targetSvgFile = path.join(sourceDirPath, filename);
                    fs.writeFileSync(
                        targetSvgFile,
                        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="200" height="200">\n${svgPaths.join('\n')}\n</svg>`
                    );
                }
            });

        }

        // console.log('result', result);
        // const svgString = parse(result);
        // // console.log('svgString',svgString);
        // const svgPaths = remarkSVGPaths(svgString.children);
        // console.log('svgPaths', svgPaths);
        // symbol.push(`  <symbol id="${iconCode}" viewBox="0 0 1024 1024">\n${svgPaths.join('\n')}\n  </symbol>`);
        // iconCodes.push(`'${filename}'`);

        // logger.success(`${file}`);
        // }else{
        // logger.error(`${file} --> not find svg tag`);
    }




    // By OSX Notice
    bash(`osascript -e 'display notification "${basePath} done" with title "publish done"'`);
}

run({path: './example/iconfont'});
export default run;
module.exports = run;