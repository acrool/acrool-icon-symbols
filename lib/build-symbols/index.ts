import * as fs from 'fs';
import path from 'path';
import {regPattern} from 'bear-jsutils/equal';
import logger from '../script/logger';
import {parse, Node} from 'svg-parser';
import {bash, checkIsSVGMultiColor, getFilesizeInBytes, remarkSVGPaths} from '../script/utils';

interface IArgs {
    path: string,
    idPrefix?: string
}


/**
 * reg: https://regex101.com/r/ai3qvO/1
 */
async function run(args: IArgs) {
    const basePath = typeof args.path !== 'undefined' ? args.path: './';
    const sourceDirPath = path.join(basePath, '_sources');
    const idPrefix = typeof args.idPrefix !== 'undefined' ? args.idPrefix: 'icon_';

    logger.info(`svg merge symbols ${basePath} ...`);

    const symbol: string[] = [];
    const iconCodes: string[] = [];

    const dirChildFiles = fs.readdirSync(sourceDirPath);

    const targetSvgFile = path.join(basePath, 'index.svg');
    const targetTsTypeFile = path.join(basePath, 'icon.d.ts');
    const targetDartTypeFile = path.join(basePath, 'icon.dart');

    dirChildFiles.forEach(file => {
        if (path.extname(file) == '.svg'){
            const filename = file.replace('.svg', '');
            const iconCode = [idPrefix, filename].join('');

            const svgContent = fs
                .readFileSync(path.join(sourceDirPath, file), {encoding:'utf8', flag:'r'})
                .toString();

            const reg = new RegExp(regPattern.svg);
            const svgTag = reg.exec(svgContent);

            if(svgTag && svgTag.length > 0){
                const result = svgTag[0];
                const svgString = parse(result);

                // diff svgPaths
                const isMultiColor = checkIsSVGMultiColor(svgString.children);
                const svgPaths = remarkSVGPaths(svgString.children, isMultiColor);

                symbol.push(`  <symbol id="${iconCode}" viewBox="0 0 1024 1024">\n${svgPaths.join('\n')}\n  </symbol>`);
                iconCodes.push(`${filename}`);

                logger.info(`${file}`);
            }else{
                logger.error(`${file} --> not find svg tag`);
            }



        }

    });

    // write file
    fs.writeFileSync(targetSvgFile, `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">\n
${symbol.join('\n\n')}\n
</svg>`);
    logger.success(`Build to ${targetSvgFile}, size: ${getFilesizeInBytes(targetSvgFile)}`);

    // write type file
    fs.writeFileSync(targetTsTypeFile, `declare type IconCode = ${iconCodes.map(code => `'${code}'`).join('|')};`);
    logger.success(`Build to ${targetTsTypeFile}, size: ${getFilesizeInBytes(targetTsTypeFile)}`);

    const varName = 'Map<EIconCode, String> iconCodeMapping';

    // write type file
    fs.writeFileSync(targetDartTypeFile, `
enum EIconCode {
  ${iconCodes.join(',\n  ')}
}

${varName} = {
  ${iconCodes.map(code => {
        return `EIconCode.${code}: '${code}',`;
    }).join('\n  ')}    
};


`);
    logger.success(`Build to ${targetDartTypeFile}, size: ${getFilesizeInBytes(targetDartTypeFile)}`);


    // By OSX Notice
    bash(`osascript -e 'display notification "${basePath} done" with title "publish done"'`);
}

export default run;
module.exports = run;