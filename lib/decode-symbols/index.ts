import * as fs from 'fs';
import path from 'path';
import logger from '../script/logger';
import {bash} from '../script/utils';
import {regPattern} from 'bear-jsutils/equal';
import {removeStartEnd} from 'bear-jsutils/string';

interface IArgs {
    path: string,
}


async function run(args: IArgs) {
    const basePath = typeof args.path !== 'undefined' ? args.path: './';
    const sourceDirPath = path.join(basePath, '_sources');
    if (!fs.existsSync(sourceDirPath)){
        fs.mkdirSync(sourceDirPath, {recursive: true});
    }

    logger.info(`symbols split svg ${basePath} ...`);

    const targetSvgFile = path.join(basePath, 'index.svg');

    const svgContent = fs
        .readFileSync(targetSvgFile, {encoding:'utf8', flag:'r'})
        .toString();
    const symbols = svgContent.match(regPattern.symbol);

    if(symbols !== null){
        symbols.forEach(symbol => {
            const idRes = new RegExp(regPattern.htmlAttrId).exec(symbol);
            if(idRes && idRes.length > 1){
                const targetSvgFile = path.join(sourceDirPath, `${idRes[1]}.svg`);
                const pathContent = removeStartEnd(symbol, '<symbol\\b[^>]*?(?:viewBox=\\"(\\b[^"]*)\\")?>', '<\\/symbol>');

                // ======== write type file start ========
                fs.writeFileSync(targetSvgFile, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="200" height="200">${pathContent}</svg>`);
                // ======== write type file end ========
            }

        });
    }


    logger.success(`Split to ${sourceDirPath}`);


    // By OSX Notice
    bash(`osascript -e 'display notification "${basePath} done" with title "publish done"'`);
}

export default run;
module.exports = run;