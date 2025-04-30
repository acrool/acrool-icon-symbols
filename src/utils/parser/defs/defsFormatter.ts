import {objectKeys} from '@acrool/js-utils/object';
import {IDef} from '../../../types';
import {formatAttrKeyValue, createTag} from '../../common';

export const formatChildren = (children: IDef[], isMultiColor: boolean): string[] => {
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

        return createTag(childEl.tag, [...childAttr, ...childProperties]);
    });
};

export const formatDefs = (defs: IDef[], isMultiColor: boolean): string[] => {
    return defs.map(el => {
        const attr = objectKeys(el.attr).map(attrKey => formatAttrKeyValue(attrKey, el.attr[attrKey]));
        const children = el.children ? formatChildren(el.children, isMultiColor) : undefined;
        return createTag(el.tag, attr, children);
    });
}; 