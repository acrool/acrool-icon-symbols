import {XMLParser} from 'fast-xml-parser';
import {ulid} from 'ulid';
import {isNotEmpty} from '@acrool/js-utils/equal';
import {
    IDef,
    TTagKey,
    IDecodeSvgContentRes
} from '../../types';
import {extractIdFromUrl} from '../common';

const xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    allowBooleanAttributes: true,
    parseTagValue: false,
    parseAttributeValue: false,
});

/**
 * 解析 SVG 内容并提取关键信息
 *
 * 该函数将 SVG 字符串内容解析为结构化的对象，包括：
 * - 不同的填充颜色列表
 * - 视图框信息
 * - SVG 内容元素
 * - 定义（defs）元素
 *
 * 处理过程中会：
 * 1. 解析 SVG XML 内容
 * 2. 处理 defs 元素并生成新的唯一 ID
 * 3. 处理所有 SVG 元素及其属性
 * 4. 收集所有不同的填充颜色
 * 5. 维护元素之间的引用关系
 *
 * @param {string} svgContent - 要解析的 SVG 字符串内容
 * @returns {Object} 解析后的 SVG 信息对象，包含：
 *   - fillDiffColor: string[] - 所有不同的填充颜色列表
 *   - viewBox: string - SVG 的视图框信息
 *   - content: IDef[] - SVG 的主要内容元素
 *   - defs: IDef[] - SVG 的定义元素
 */
export const decodeSvgContent = (svgContent: string): IDecodeSvgContentRes => {
    const parsed = xmlParser.parse(svgContent);
    const svg = parsed.svg;
    const viewBox = svg?.viewBox;
    const fillNone = svg?.fill === 'none';

    const fillDiffColor: string[] = [];
    const contentTags: TTagKey[] = ['ellipse', 'path', 'circle', 'g', 'stop', 'rect'];
    const defChildTag = ['clipPath', 'linearGradient'];

    const defIdMap = new Map<string | undefined, string | undefined>();
    const defsContent: IDef[] = [];

    if (svg?.defs) {
        const defsArray: Array<{ [key: string]: any }> = Array.isArray(svg.defs) ? svg.defs : [svg.defs];
        defsArray.forEach(defsItem => {
            if (!defsItem) return;
            defChildTag.forEach(tagName => {
                const defElements = defsItem[tagName];
                if (!defElements) return;
                const defElementsArray = Array.isArray(defElements) ? defElements : [defElements];
                defElementsArray.forEach(defEl => {
                    if (!defEl) return;
                    const oldId = defEl.id;
                    const newId = oldId ? `svg_def_${ulid().toLowerCase()}` : undefined;
                    defIdMap.set(oldId, newId);

                    const defAttr: IDef = {
                        tag: tagName,
                        attr: {
                            ...defEl,
                            id: newId,
                        },
                        children: [],
                    };

                    contentTags.forEach(childTag => {
                        const children = defEl[childTag];
                        if (children) {
                            const childrenArray = Array.isArray(children) ? children : [children];
                            childrenArray.forEach(child => {
                                if (!defAttr.children) defAttr.children = [];
                                defAttr.children.push({
                                    tag: childTag,
                                    attr: {...child},
                                });
                            });
                        }
                    });

                    defsContent.push(defAttr);
                });
            });
        });
    }

    const processElement = (el: any): IDef => {
        const tag = el ? el['#name'] || el.tagName || Object.keys(el).find(k => contentTags.includes(k as TTagKey)) : undefined;
        if (!tag) return {tag: '', attr: {}};
        const attributes = {...el};
        delete attributes['#name'];
        delete attributes['tagName'];
        contentTags.forEach(ct => {
            if (attributes.hasOwnProperty(ct)) {
                delete attributes[ct];
            }
        });

        if (attributes.fill) {
            if (attributes.fill.startsWith('url(#')) {
                const id = extractIdFromUrl(attributes.fill);
                const replaceId = defIdMap.get(id) ?? id;
                attributes.fill = `url(#${replaceId})`;

            } else if (!fillDiffColor.includes(attributes.fill)) {
                fillDiffColor.push(attributes.fill);
            }
        }

        if (attributes['clip-path']) {
            if (attributes['clip-path'].startsWith('url(#')) {
                const id = extractIdFromUrl(attributes['clip-path']);
                const replaceId = defIdMap.get(id) ?? id;
                attributes['clip-path'] = `url(#${replaceId})`;
            }
        }

        const children: IDef[] = [];

        contentTags.forEach(childTag => {
            const childEls = el[childTag];
            if (childEls) {
                const childElsArray = Array.isArray(childEls) ? childEls : [childEls];
                childElsArray.forEach(childEl => {
                    children.push(processElement({...childEl, '#name': childTag}));
                });
            }
        });

        return {
            tag,
            attr: attributes,
            ...(children.length > 0 && {children}),
        };
    };

    const content: IDef[] = [];
    if (svg) {
        contentTags.forEach(tag => {
            const elements = svg[tag];
            if (elements) {
                const elementsArray = Array.isArray(elements) ? elements : [elements];
                elementsArray.forEach(el => {
                    const elementDef = processElement({...el, '#name': tag});
                    if (elementDef.tag === 'g' && !isNotEmpty(elementDef.attr)) {
                        content.push(...(elementDef.children || []));
                    } else {
                        content.push(elementDef);
                    }
                });
            }
        });
    }

    return {
        fillDiffColor,
        viewBox,
        content,
        defs: defsContent,
        fillNone,
    };
};
