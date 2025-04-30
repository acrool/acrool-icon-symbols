import {ulid} from 'ulid';
import {objectKeys} from '@acrool/js-utils/object';
import {IDef, TTagKey} from '../../../types';
import {extractIdFromUrl} from '../../common';

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