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
    IDef,
    TTagKey,
    ISvgAttributes,
    TDecodeSvgContent,
    TDecodeSymbols,
    TFormatSvgContent
} from './utils.d';
import {
    ulid
} from 'ulid';


export const extractIdFromUrl = (input: string): string | null => {
    const regex = /url\(#([^)]+)\)/; // 正則表達式匹配 `url(#id)`
    const match = input.match(regex); // 使用 `match` 方法找出符合的部分
    return match ? match[1] : null; // 如果找到匹配項，返回捕獲的 `id`，否則返回 `null`
};


export const extractId = (input: string): string | null => {
    const regex = /id="([^"]+)"/; // 匹配 id 屬性的值
    const match = input.match(regex);
    return match ? match[1] : null; // 返回捕獲的值，或返回 null
};

const onlyUnique = (value: string, index: number, self: string[]): boolean => {
    return self.indexOf(value) === index;
};


const getAttr = (el: cheerio.Cheerio): ISvgAttributes => {
    return removeUndefinedValues({
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

        gradientUnits: el.attr('gradientUnits'),

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
        stopOpacity: el.attr('stop-opacity'),
        stopColor: el.attr('stop-color'),
        offset: el.attr('offset'),
    });
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
export const formatSvgContent: TFormatSvgContent = (svgContent) => {
    const {fillDiffColor, content, defs, viewBox} = decodeSvgContent(svgContent);

    const isMultiColor = fillDiffColor.length >= 2;

    return {
        viewBox,
        defs: defs.reduce<string[]>((curr, el) => {
            const attr = objectKeys(el.attr)
                .map(attrKey => {
                    if(attrKey === 'gradientUnits'){
                        return `${attrKey}="${el.attr[attrKey]}"`;
                    }
                    return `${lowerCaseToLowerDashCase(attrKey as string)}="${el.attr[attrKey]}"`;
                });

            if(el.children){

                const childProperties2 = el.children.reduce<string[]>((childCurr, childEl) => {

                    const childAttr = objectKeys(childEl.attr)
                        .map(attrKey => {
                            if(attrKey === 'gradientUnits'){
                                return `${attrKey}="${childEl.attr[attrKey]}"`;
                            }
                            return `${lowerCaseToLowerDashCase(attrKey as string)}="${childEl.attr[attrKey]}"`;
                        });

                    childCurr.push(`<${childEl.tag} ${childAttr.join(' ')}/>`);

                    return childCurr;
                }, []);

                curr.push(`<${el.tag} ${attr.join(' ')}>
    ${childProperties2.join('')}
</${el.tag}>`);


            }else{
                curr.push(`<${el.tag} ${attr.join(' ')}/>`);
            }

            return curr;
        }, []),
        content: content.reduce<string[]>((curr, el) => {

            const {fillOpacity, stroke, ...pathAttr} = el.attr;

            const properties: string[] = [];

            const attr = objectKeys(pathAttr)
                .map(attrKey => {
                    if(attrKey === 'gradientUnits'){
                        return `${attrKey}="${pathAttr[attrKey]}"`;
                    }
                    return `${lowerCaseToLowerDashCase(attrKey as string)}="${pathAttr[attrKey]}"`;
                });

            if(isMultiColor) {
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

            if(el.children){

                const childProperties2 = el.children.reduce<string[]>((childCurr, childEl) => {
                    const {fillOpacity, stroke, ...pathAttr} = childEl.attr;

                    const childProperties: string[] = [];

                    const childAttr = objectKeys(pathAttr)
                        .map(attrKey => {
                            if(attrKey === 'gradientUnits'){
                                return `${attrKey}="${pathAttr[attrKey]}"`;
                            }
                            return `${lowerCaseToLowerDashCase(attrKey as string)}="${pathAttr[attrKey]}"`;
                        });

                    if(isMultiColor) {
                        if (fillOpacity) {
                            childProperties.push(`fill-opacity="${fillOpacity}"`);
                        }
                        if (stroke) {
                            childProperties.push(`stroke="${stroke}"`);
                        }
                    }else{
                        if (stroke) {
                            childProperties.push('stroke="currentColor"');
                        }
                    }
                    childCurr.push(`<${childEl.tag} ${childAttr.join(' ')} ${childProperties.join(' ')}/>`);

                    return childCurr;
                }, []);

                curr.push(`<${el.tag} ${[...attr, ...properties].join(' ')}>
    ${childProperties2.join('')}
</${el.tag}>`);


            }else{
                curr.push(`<${el.tag} ${attr.join(' ')} ${properties.join(' ')}/>`);
            }

            return curr;
        }, []),
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
export const decodeSvgContent: TDecodeSvgContent = (svgContent) => {
    const $ = cheerio.load(svgContent, {xmlMode: true});
    const root = $('svg');
    const viewBox = root.attr('viewBox');

    const fillDiffColor: string[] = [];

    const content: IDef[] = [];

    const defsContent: IDef[] = [];

    // 儲存 Def 中的對應ID (重新命名)
    const defIdMap = new Map();

    const contentTags: TTagKey[] = ['ellipse', 'path', 'circle', 'g', 'stop', 'rect'];

    const defChildTag = ['clipPath','linearGradient'];

    // 處理 Defs
    const defs = root.find('defs');

    // clipPath 或 linearGradient
    defChildTag.forEach(tag => {
        defs.find(`> ${tag}`).each((index, defElement) => {
            const defEl = $(defElement);

            // 找到並設定ID
            const oldId = defEl.attr('id');
            const newId = oldId ? `svg_def_${ulid().toLowerCase()}`: undefined;
            defIdMap.set(oldId, newId);

            const linearGradientAttr: IDef = {
                tag: tag,
                attr: {
                    ...getAttr(defEl),
                    id: newId,
                },
                children: [],
            };

            contentTags.forEach(contentTag => {
                defEl.find(`> ${contentTag}`).each((index, childElement) => {
                    const stopEl = $(childElement);

                    if(!linearGradientAttr.children) linearGradientAttr.children = [];
                    linearGradientAttr.children.push({
                        tag: contentTag,
                        attr: getAttr(stopEl),
                    });
                });
            });

            defsContent.push(linearGradientAttr);

        });

    });

    // 處理一般屬性
    const getData = (rootCheerio: cheerio.Cheerio) => {
        contentTags.forEach(tag => {
            rootCheerio.find(`> ${tag}`).each((index, element) => {
                // 依照需要的屬性追加
                const el = $(element);

                const attributes: ISvgAttributes = getAttr(el);

                if(attributes.fill){
                    if(attributes.fill.startsWith('url(#')){
                        const id = extractIdFromUrl(attributes.fill);
                        attributes.fill = `url(#${defIdMap.get(id)})`;
                    }else if(!fillDiffColor.includes(attributes.fill)){
                        fillDiffColor.push(attributes.fill);
                    }
                }

                if(attributes.clipPath){
                    if(attributes.clipPath.startsWith('url(#')){
                        const id = extractIdFromUrl(attributes.clipPath);
                        attributes.clipPath = `url(#${defIdMap.get(id)})`;
                    }
                }

                if(el.children().length > 0){

                    // 再一次
                    const child: IDef['children'] = [];
                    contentTags.forEach(childTag => {
                        el.find(`> ${childTag}`).each((index, element) => {
                            // 依照需要的屬性追加
                            const el = $(element);

                            const attributes2: ISvgAttributes = getAttr(el);

                            if(attributes2.fill){
                                if(attributes2.fill.startsWith('url(#')){
                                    const id = extractIdFromUrl(attributes2.fill);
                                    attributes2.fill = `url(#${defIdMap.get(id)})`;
                                }else if(!fillDiffColor.includes(attributes2.fill)){
                                    fillDiffColor.push(attributes2.fill);
                                }
                            }

                            if(attributes2.clipPath){
                                if(attributes2.clipPath.startsWith('url(#')){
                                    const id = extractIdFromUrl(attributes2.clipPath);
                                    attributes2.clipPath = `url(#${defIdMap.get(id)})`;
                                }
                            }


                            child.push({
                                tag: childTag,
                                attr: attributes2,
                            });

                        });
                    });

                    content.push({
                        tag,
                        attr: attributes,
                        children: child,
                    });


                }else{
                    // 推入Tag
                    content.push({
                        tag,
                        attr: attributes,
                    });
                }

            });
        });
    };

    getData(root);



    return {
        fillDiffColor,
        viewBox,
        content,
        defs: defsContent,
    };
};
