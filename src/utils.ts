import {Node} from 'svg-parser';
import * as cheerio from 'cheerio';
import {
    objectKeys
} from '@acrool/js-utils/object';
import {
    lowerCaseToLowerDashCase,
    removeStartEnd,
    removeUndefinedValues
} from '@acrool/js-utils/string';
import {
    regPattern
} from '@acrool/js-utils/equal';
import {
    ISvgAttributes,
    TDecodeSvgPaths,
    TDecodeSymbols,
    TFormatSvgPaths
} from './utils.d';




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
export const formatSvgPaths: TFormatSvgPaths = (svgContent) => {
    const {fillDiffColor, paths, ellipses, rects, circle, g, step, viewBox} = decodeSvgPaths(svgContent);

    const isMultiColor = fillDiffColor.length >= 2;

    return {
        viewBox,
        step: step.map(path => {
            const attr = objectKeys(path)
                .map(attrKey => {
                    return `${lowerCaseToLowerDashCase(attrKey as string)}="${path[attrKey]}"`;
                });
            return `<rect ${attr.join(' ')}/>`;
        }),
        g: g.map(path => {
            const attr = objectKeys(path)
                .map(attrKey => {
                    return `${lowerCaseToLowerDashCase(attrKey as string)}="${path[attrKey]}"`;
                });
            return `<rect ${attr.join(' ')}/>`;
        }),
        rects: rects.map(path => {
            const attr = objectKeys(path)
                .map(attrKey => {
                    return `${lowerCaseToLowerDashCase(attrKey as string)}="${path[attrKey]}"`;
                });
            return `<rect ${attr.join(' ')}/>`;
        }),
        ellipses: ellipses.map(path => {
            const attr = objectKeys(path)
                .map(attrKey => {
                    return `${lowerCaseToLowerDashCase(attrKey as string)}="${path[attrKey]}"`;
                });
            return `<ellipse ${attr.join(' ')}/>`;
        }),
        circle: circle.map(path => {
            const attr = objectKeys(path)
                .map(attrKey => {
                    return `${lowerCaseToLowerDashCase(attrKey as string)}="${path[attrKey]}"`;
                });
            return `<circle ${attr.join(' ')}/>`;
        }),
        paths: paths.map(path => {
            const {fill, fillOpacity, stroke, ...pathAttr} = path;

            const properties: string[] = [];

            const attr = objectKeys(pathAttr)
                .map(attrKey => {
                    return `${lowerCaseToLowerDashCase(attrKey as string)}="${pathAttr[attrKey]}"`;
                });

            if(isMultiColor) {
                if (fill) {
                    properties.push(`fill="${fill}"`);
                }
                if (fillOpacity) {
                    properties.push(`fill-opacity="${fillOpacity}"`);
                }
                if (stroke) {
                    properties.push(`stroke="${stroke}"`);
                }
            }else{
                if (stroke) {
                    properties.push('stroke="currentColor"');
                }
            }

            return `<path ${attr.join(' ')} ${properties.join(' ')}/>`;
        }),
    };


};


/**
 * 解析Symbols
 * @param symbolsContent
 */
export const decodeSymbols: TDecodeSymbols = (symbolsContent) => {
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



/**
 * 解析SVG 的Path
 * (如果只有 <path .../><path .../> 則自行用 <svg>{paths}</svg> 包裝起來)
 * @param svgContent
 */
export const decodeSvgPaths: TDecodeSvgPaths = (svgContent) => {
    const $ = cheerio.load(svgContent);
    const root = $('svg');
    const viewBox = root.attr('viewBox');

    const fillDiffColor: string[] = [];
    const paths: ISvgAttributes[] = [];
    const rects: ISvgAttributes[] = [];
    const ellipses: ISvgAttributes[] = [];
    const circle: ISvgAttributes[] = [];
    const g: ISvgAttributes[] = [];
    const step: ISvgAttributes[] = [];

    root.find('rect').each((index, element) => {
        // 依照需要的屬性追加
        const el = $(element);

        const attributes: ISvgAttributes = removeUndefinedValues({
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
            clipPath: el.attr('clip-path'),

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
        });

        if(attributes.fill && !fillDiffColor.includes(attributes.fill)){
            fillDiffColor.push(attributes.fill);
        }
        rects.push(attributes);
    });

    root.find('ellipse').each((index, element) => {
        // 依照需要的屬性追加
        const el = $(element);

        const attributes: ISvgAttributes = removeUndefinedValues({
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
            clipPath: el.attr('clip-path'),

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
        });

        if(attributes.fill && !fillDiffColor.includes(attributes.fill)){
            fillDiffColor.push(attributes.fill);
        }
        ellipses.push(attributes);
    });


    root.find('path').each((index, element) => {

        // 依照需要的屬性追加
        const el = $(element);

        const attributes: ISvgAttributes = removeUndefinedValues({
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
            clipPath: el.attr('clip-path'),

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
        });



        if(attributes.fill && !fillDiffColor.includes(attributes.fill)){
            fillDiffColor.push(attributes.fill);
        }
        paths.push(attributes);
    });


    root.find('circle').each((index, element) => {

        // 依照需要的屬性追加
        const el = $(element);

        const attributes: ISvgAttributes = removeUndefinedValues({
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
            clipPath: el.attr('clip-path'),

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
        });



        if(attributes.fill && !fillDiffColor.includes(attributes.fill)){
            fillDiffColor.push(attributes.fill);
        }
        circle.push(attributes);
    });

    root.find('g').each((index, element) => {

        // 依照需要的屬性追加
        const el = $(element);

        const attributes: ISvgAttributes = removeUndefinedValues({
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
            clipPath: el.attr('clip-path'),

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
        });



        if(attributes.fill && !fillDiffColor.includes(attributes.fill)){
            fillDiffColor.push(attributes.fill);
        }
        g.push(attributes);
    });


    root.find('step').each((index, element) => {

        // 依照需要的屬性追加
        const el = $(element);

        const attributes: ISvgAttributes = removeUndefinedValues({
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
            clipPath: el.attr('clip-path'),

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



            stopColor: el.attr('stop-color'),
            offset: el.attr('offset'),
        });



        if(attributes.fill && !fillDiffColor.includes(attributes.fill)){
            fillDiffColor.push(attributes.fill);
        }
        step.push(attributes);
    });

    return {
        fillDiffColor,
        viewBox,
        paths,
        rects,
        ellipses,
        circle,
        g,
        step,
    };
};
