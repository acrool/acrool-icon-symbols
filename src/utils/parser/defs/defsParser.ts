import {ulid} from 'ulid';

import {IDef, TTagKey} from '../../../types';
import {extractIdFromUrl} from '../../common';

/**
 * 解析 SVG 中的 defs 元素
 * @param defs - SVG 中的 defs 元素数据
 * @param contentTags - 需要处理的内容标签列表
 * @returns 包含 defIdMap 和 defsContent 的对象
 * @description
 * - defIdMap: 存储原始 ID 到新生成 ID 的映射关系
 * - defsContent: 处理后的 defs 内容数组
 */
export const parseDefs = (defs: any, contentTags: TTagKey[]) => {
    const defChildTag = ['clipPath', 'linearGradient'];
    const defIdMap = new Map<string | undefined, string | undefined>();
    const defsContent: IDef[] = [];

    if (defs) {
        const defsArray: Array<{ [key: string]: any }> = Array.isArray(defs) ? defs : [defs];
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

    return {defIdMap, defsContent};
};

/**
 * 处理 SVG 元素，包括属性处理和子元素递归处理
 * @param el - 要处理的 SVG 元素
 * @param contentTags - 需要处理的内容标签列表
 * @param defIdMap - ID 映射关系表
 * @returns 处理后的元素对象
 * @description
 * - 处理元素的标签名和属性
 * - 处理 fill 和 clipPath 中的 URL 引用
 * - 递归处理子元素
 */
export const processElement = (el: any, contentTags: TTagKey[], defIdMap: Map<string | undefined, string | undefined>): IDef => {
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
        }
    }

    if (attributes['clip-path']) {
        if (typeof attributes['clip-path'] === 'string' && attributes['clip-path'].startsWith('url(#')) {
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
                children.push(processElement({...childEl, '#name': childTag}, contentTags, defIdMap));
            });
        }
    });

    return {
        tag,
        attr: attributes,
        ...(children.length > 0 && {children}),
    };
};
