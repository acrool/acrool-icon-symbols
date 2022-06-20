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
 * reg: https://regex101.com/r/ai3qvO/1
 * run test: ts-node lib/build-symbols/index.ts
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

            const svgContent = fs
                .readFileSync(path.join(basePath, file), {encoding:'utf8', flag:'r'})
                .toString();

            const reg = new RegExp(regRules.svg);
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

// run({path: './example/build-symbols/_sources'});
export default run;
module.exports = run;