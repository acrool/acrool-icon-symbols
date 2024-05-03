import {Node} from 'svg-parser';
import {regPattern} from 'bear-jsutils/equal';
import {removeStartEnd} from 'bear-jsutils/string';
import * as cheerio from 'cheerio';



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





/**
 * 解析SVGPath
 * @param svgContent
 */
export const formatSvgPaths = (svgContent: string) => {
    const {fillDiffColor, paths, viewBox} = decodeSvgPaths(svgContent);

    const isMultiColor = fillDiffColor.length >= 2;

    return {
        viewBox,
        paths: paths.map(row => {
            const properties = [];

            if(isMultiColor) {
                if (row.fill) {
                    properties.push(`fill="${row.fill}"`);
                }
                if (row.fillOpacity) {
                    properties.push(`fill-opacity="${row.fillOpacity}"`);
                }
            }
            if (row.fillRule) {
                properties.push(`fill-rule="${row.fillRule}"`);
            }
            if (row.clipRule) {
                properties.push(`clip-rule="${row.clipRule}"`);
            }
            if(row.d){
                properties.push(`d="${row.d}"`);
            }
            return `<path ${properties.join(' ')}/>`;

        }),
    };


};


/**
 * 解析Symbols
 * @param symbolsContent
 */
export const decodeSymbols = (symbolsContent: string) => {
    const symbols = symbolsContent.match(regPattern.symbol);
    const idPrefix = 'icon_';

    const data: Array<{
        code: string,
        viewBox: string,
        content: string,
    }> = [];
    if(symbols !== null){
        symbols.forEach(symbol => {
            const idRes = new RegExp(regPattern.htmlAttrId).exec(symbol);
            if(idRes && idRes.length > 1){
                // const targetSvgFile = path.join(sourceDirPath, `${idRes[1].replace(idPrefix,'')}.svg`);
                const pathContent = removeStartEnd(symbol, '<symbol\\b[^>]*?(?:viewBox=\\"(\\b[^"]*)\\")?>', '<\\/symbol>');
                const viewBox = new RegExp(/<symbol\b[^>]*?(?:viewBox=\"(\b[^"]*)\")?>/).exec(symbol);

                // ======== write type file start ========
                data.push({
                    code: idRes[1].replace(idPrefix,''),
                    viewBox: viewBox ? viewBox[1]: '0 0 1024',
                    content: pathContent.trim().replace('    ',''),
                });
                // ======== write type file end ========
            }

        });
    }

    return data;

};




interface IAttr{
    d?: string,
    fill?: string,
    fillOpacity?: string,
    fillRule?: string,
    clipRule?: string,
}

/**
 * 解析SVG 的Path
 * (如果只有 <path .../><path .../> 則自行用 <svg>{paths}</svg> 包裝起來)
 * @param svgContent
 */
export const decodeSvgPaths = (svgContent: string) => {
    const $ = cheerio.load(svgContent);
    const root = $('svg');
    const viewBox = root.attr('viewBox');

    const fillDiffColor: string[] = [];
    const paths: IAttr[] = [];
    root.find('path').each((index, element) => {
        const d = $(element).attr('d')?.toString()
            .replace(/\n/g,'')
            .replace(/\t/g, '')
        ;

        // 依照需要的屬性追加
        const fill = $(element).attr('fill')?.toLocaleString();
        const fillOpacity = $(element).attr('fill-opacity')?.toString().replace('0.','.');
        const fillRule = $(element).attr('fill-rule')?.toString();
        const clipRule = $(element).attr('clip-rule')?.toString();
        if(fill && !fillDiffColor.includes(fill)){
            fillDiffColor.push(fill);
        }
        paths.push({
            d,
            fill,
            fillOpacity,
            clipRule,
            fillRule,
        });
    });

    return {
        fillDiffColor,
        viewBox,
        paths,
    };
};
