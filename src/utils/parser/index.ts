import {XMLParser} from 'fast-xml-parser';
import {ulid} from 'ulid';
import {objectKeys} from '@acrool/js-utils/object';
import {isNotEmpty} from '@acrool/js-utils/equal';
import {IDef, TTagKey, TDecodeSvgContent, TDecodeSymbols, TFormatSvgContent} from '../../types';
import {extractIdFromUrl} from '../common';
import {formatAttrKeyValue, createTag} from '../common';

const xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    allowBooleanAttributes: true,
    parseTagValue: false,
    parseAttributeValue: false,
});

const formatChildren = (children: IDef[], isMultiColor: boolean): string[] => {
    return children.map(childEl => {
        const {fillOpacity, stroke, ...pathAttr} = childEl.attr;
        const childAttr = objectKeys(pathAttr).map(attrKey => formatAttrKeyValue(attrKey, pathAttr[attrKey]));

        const childProperties: string[] = [];
        if (isMultiColor) {
            if (fillOpacity) childProperties.push(`fill-opacity="${fillOpacity}"`);
            if (stroke) childProperties.push(`stroke="${stroke}"`);
        } else {
            if (stroke) childProperties.push('stroke="currentColor"');
        }

        return `<${childEl.tag} ${[...childAttr, ...childProperties].join(' ')}/>`;
    });
};

export const decodeSymbols: TDecodeSymbols = (symbolsContent) => {
    const data: Array<{
        code: string,
        viewBox: string,
        content: string,
    }> = [];

    const parsed = xmlParser.parse(`<root>${symbolsContent}</root>`);
    const symbols = parsed.root?.symbol;
    const symbolsArray = Array.isArray(symbols) ? symbols : symbols ? [symbols] : [];

    const idPrefix = 'icon_';

    symbolsArray.forEach(symbol => {
        const id = symbol.id;
        if (id) {
            const viewBox = symbol.viewBox || '0 0 1024';
            let content = symbolsContent;
            const symbolStringRegex = new RegExp(`<symbol[^>]*id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/symbol>`, 'i');
            const match = symbolsContent.match(symbolStringRegex);
            if (match && match[1]) {
                content = match[1].trim().replace('    ','');
            } else {
                content = '';
            }

            data.push({
                code: id.replace(idPrefix,''),
                viewBox,
                content,
            });
        }
    });

    return data;
};

export const decodeSvgContent: TDecodeSvgContent = (svgContent) => {
    const parsed = xmlParser.parse(svgContent);
    const svg = parsed.svg;
    const viewBox = svg?.viewBox;

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
            if (typeof attributes.fill === 'string' && attributes.fill.startsWith('url(#')) {
                const id = extractIdFromUrl(attributes.fill);
                const replaceId = defIdMap.get(id) ?? id;
                attributes.fill = `url(#${replaceId})`;
            } else if (!fillDiffColor.includes(attributes.fill)) {
                fillDiffColor.push(attributes.fill);
            }
        }

        if (attributes.clipPath) {
            if (typeof attributes.clipPath === 'string' && attributes.clipPath.startsWith('url(#')) {
                const id = extractIdFromUrl(attributes.clipPath);
                const replaceId = defIdMap.get(id) ?? id;
                attributes.clipPath = `url(#${replaceId})`;
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
    };
};

export const formatSvgContent: TFormatSvgContent = (svgContent) => {
    const {fillDiffColor, content, defs, viewBox} = decodeSvgContent(svgContent);
    const uniqueColors = fillDiffColor.filter((c, i, arr) => c && arr.indexOf(c) === i);
    const isMultiColor = uniqueColors.length >= 2;

    return {
        viewBox,
        defs: defs.map(el => {
            const attr = objectKeys(el.attr).map(attrKey => formatAttrKeyValue(attrKey, el.attr[attrKey]));
            const children = el.children ? formatChildren(el.children, isMultiColor) : undefined;
            return createTag(el.tag, attr, children);
        }),
        content: content.map(el => {
            const {fillOpacity, stroke, ...pathAttr} = el.attr;
            const attr = objectKeys(pathAttr).map(attrKey => formatAttrKeyValue(attrKey, pathAttr[attrKey]));

            const properties: string[] = [];
            if (isMultiColor) {
                if (fillOpacity) properties.push(`fill-opacity="${fillOpacity}"`);
                if (stroke) properties.push(`stroke="${stroke}"`);
            } else {
                if (stroke) properties.push('stroke="currentColor"');
            }

            const children = el.children ? formatChildren(el.children, isMultiColor) : undefined;
            return createTag(el.tag, [...attr, ...properties], children);
        }),
    };
};
