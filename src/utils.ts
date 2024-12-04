import {Node} from 'svg-parser';
import * as cheerio from 'cheerio';


export const regPattern = {
    number: /^(\d+)$/,
    double: /^\d+(\.\d+)?$/,
    account: /^[A-Za-z0-9]+$/,
    email: /^[A-Za-z0-9._-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
    protocolDomain: /(http(s)?:\/\/.)(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}/g,
    domain: /(:(http(s)?:\/\/.))?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}/g,
    ipAddress: /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/,
    date: /^([0-9]{4})[/.-]{1}([0-9]{1,2})[/.-]{1}([0-9]{1,2})$/,
    svg: /<svg\b[^>]*?(?:viewBox=\"(\b[^"]*)\")?>([\s\S]*?)<\/svg>/g,
    symbol: /<symbol\b[^>]*?(?:viewBox=\"(\b[^"]*)\")?>([\s\S]*?)<\/symbol>/g,
    htmlAttrId: /id=\"(.*?)\"/g,
};


export function removeStartEnd(str: string, startStr: string, endStr: string): string {
    const regRule = `\\${startStr}|\\${endStr}`;
    const reg = new RegExp(`^${regRule}$`,'g');
    return str.replace(reg, '');
}

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



interface ISvgAttributes {
    // 通用屬性
    style?: string | null;
    transform?: string | null;
    visibility?: string | null;
    display?: string | null;
    opacity?: string | null;

    // 填充相關屬性
    fill?: string | null;
    fillOpacity?: string | null;
    fillRule?: string | null;

    // 剪裁相關屬性
    clipRule?: string | null;

    // 描邊相關屬性
    stroke?: string | null;
    strokeWidth?: string | null;
    strokeOpacity?: string | null;
    strokeLinecap?: string | null;
    strokeLinejoin?: string | null;
    strokeDasharray?: string | null;
    strokeDashoffset?: string | null;

    // 幾何屬性
    x?: string | null;
    y?: string | null;
    width?: string | null;
    height?: string | null;
    cx?: string | null;
    cy?: string | null;
    r?: string | null;
    rx?: string | null;
    ry?: string | null;
    x1?: string | null;
    y1?: string | null;
    x2?: string | null;
    y2?: string | null;

    // 多邊形和路徑
    points?: string | null;
    d?: string | null;
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
    const paths: ISvgAttributes[] = [];
    const rect: ISvgAttributes[] = [];
    const ellipse: ISvgAttributes[] = [];

    root.find('rect').each((index, element) => {
        // 依照需要的屬性追加
        const el = $(element);

        const attributes: ISvgAttributes = {
            // id: el.attr('id'),
            // class: el.attr('class'),
            style: el.attr('style'),
            transform: el.attr('transform'),
            visibility: el.attr('visibility'),
            display: el.attr('display'),
            opacity: el.attr('opacity'),

            // 填充相關
            fill: el.attr('fill')?.toLocaleString(),
            fillOpacity: el.attr('fill-opacity')?.toString().replace('0.','.'),
            fillRule: el.attr('fill-rule'),

            // 裁切
            clipRule: el.attr('clip-rule'),

            // 描邊相關
            stroke: el.attr('stroke'),
            strokeWidth: el.attr('stroke-width'),
            strokeOpacity: el.attr('stroke-opacity'),
            strokeLinecap: el.attr('stroke-linecap'),
            strokeLinejoin: el.attr('stroke-linejoin'),
            strokeDasharray: el.attr('stroke-dasharray'),
            strokeDashoffset: el.attr('stroke-dashoffset'),

            // 幾何屬性 (根據具體元素類型擴展)
            x: el.attr('x'),
            y: el.attr('y'),
            width: el.attr('width'),
            height: el.attr('height'),
            cx: el.attr('cx'),
            cy: el.attr('cy'),
            r: el.attr('r'),
            rx: el.attr('rx'),
            ry: el.attr('ry'),
            x1: el.attr('x1'),
            y1: el.attr('y1'),
            x2: el.attr('x2'),
            y2: el.attr('y2'),
            points: el.attr('points'),
            d: el.attr('d')
                ?.replace(/\n/g,'')
                .replace(/\t/g, ''),
        };

        if(attributes.fill && !fillDiffColor.includes(attributes.fill)){
            fillDiffColor.push(attributes.fill);
        }
        rect.push(attributes);
    });

    root.find('ellipse').each((index, element) => {
        // 依照需要的屬性追加
        const el = $(element);

        const attributes: ISvgAttributes = {
            // id: el.attr('id'),
            // class: el.attr('class'),
            style: el.attr('style'),
            transform: el.attr('transform'),
            visibility: el.attr('visibility'),
            display: el.attr('display'),
            opacity: el.attr('opacity'),

            // 填充相關
            fill: el.attr('fill')?.toLocaleString(),
            fillOpacity: el.attr('fill-opacity')?.toString().replace('0.','.'),
            fillRule: el.attr('fill-rule'),

            // 裁切
            clipRule: el.attr('clip-rule'),

            // 描邊相關
            stroke: el.attr('stroke'),
            strokeWidth: el.attr('stroke-width'),
            strokeOpacity: el.attr('stroke-opacity'),
            strokeLinecap: el.attr('stroke-linecap'),
            strokeLinejoin: el.attr('stroke-linejoin'),
            strokeDasharray: el.attr('stroke-dasharray'),
            strokeDashoffset: el.attr('stroke-dashoffset'),

            // 幾何屬性 (根據具體元素類型擴展)
            x: el.attr('x'),
            y: el.attr('y'),
            width: el.attr('width'),
            height: el.attr('height'),
            cx: el.attr('cx'),
            cy: el.attr('cy'),
            r: el.attr('r'),
            rx: el.attr('rx'),
            ry: el.attr('ry'),
            x1: el.attr('x1'),
            y1: el.attr('y1'),
            x2: el.attr('x2'),
            y2: el.attr('y2'),
            points: el.attr('points'),
            d: el.attr('d')
                ?.replace(/\n/g,'')
                .replace(/\t/g, ''),
        };

        if(attributes.fill && !fillDiffColor.includes(attributes.fill)){
            fillDiffColor.push(attributes.fill);
        }
        rect.push(attributes);
    });


    root.find('path').each((index, element) => {

        // 依照需要的屬性追加
        const el = $(element);

        const attributes: ISvgAttributes = {
            // id: el.attr('id'),
            // class: el.attr('class'),
            style: el.attr('style'),
            transform: el.attr('transform'),
            visibility: el.attr('visibility'),
            display: el.attr('display'),
            opacity: el.attr('opacity'),

            // 填充相關
            fill: el.attr('fill')?.toLocaleString(),
            fillOpacity: el.attr('fill-opacity')?.toString().replace('0.','.'),
            fillRule: el.attr('fill-rule'),

            // 裁切
            clipRule: el.attr('clip-rule'),

            // 描邊相關
            stroke: el.attr('stroke'),
            strokeWidth: el.attr('stroke-width'),
            strokeOpacity: el.attr('stroke-opacity'),
            strokeLinecap: el.attr('stroke-linecap'),
            strokeLinejoin: el.attr('stroke-linejoin'),
            strokeDasharray: el.attr('stroke-dasharray'),
            strokeDashoffset: el.attr('stroke-dashoffset'),

            // 幾何屬性 (根據具體元素類型擴展)
            x: el.attr('x'),
            y: el.attr('y'),
            width: el.attr('width'),
            height: el.attr('height'),
            cx: el.attr('cx'),
            cy: el.attr('cy'),
            r: el.attr('r'),
            rx: el.attr('rx'),
            ry: el.attr('ry'),
            x1: el.attr('x1'),
            y1: el.attr('y1'),
            x2: el.attr('x2'),
            y2: el.attr('y2'),
            points: el.attr('points'),
            d: el.attr('d')
                ?.replace(/\n/g,'')
                .replace(/\t/g, ''),
        };



        if(attributes.fill && !fillDiffColor.includes(attributes.fill)){
            fillDiffColor.push(attributes.fill);
        }
        paths.push(attributes);
    });

    return {
        fillDiffColor,
        viewBox,
        paths,
        rect,
        ellipse,
    };
};
