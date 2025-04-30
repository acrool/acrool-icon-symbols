import {objectKeys} from '@acrool/js-utils/object';
import {IDef, TFormatSvgContent} from '../../types';
import {decodeSvgContent} from './decodeSvgContent';
import {formatAttrKeyValue, createTag} from '../common';

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

export const formatSvgContent: TFormatSvgContent = (svgContent) => {
    const {fillDiffColor, content, defs, viewBox} = decodeSvgContent(svgContent);
    const uniqueColors = fillDiffColor.filter((c, i, arr) => c && arr.indexOf(c) === i);
    const isMultiColor = uniqueColors.length >= 2;

    // 檢查是否需要處理 fill 屬性
    const hasRootFill = content.some(el => el.attr.fill);
    const hasGGroup = content.some(el => el.tag === 'g');

    let formattedContent = content.map(el => {
        const {fill, fillOpacity, stroke, ...pathAttr} = el.attr;
        const attr = objectKeys(pathAttr).map(attrKey => formatAttrKeyValue(attrKey, pathAttr[attrKey]));

        const properties: string[] = [];
        if (isMultiColor) {
            if (fill) properties.push(`fill="${fill}"`);
            if (fillOpacity) properties.push(`fill-opacity="${fillOpacity}"`);
            if (stroke) properties.push(`stroke="${stroke}"`);
        } else {
            if (stroke) properties.push('stroke="currentColor"');
        }

        const children = el.children ? formatChildren(el.children, isMultiColor) : undefined;
        return createTag(el.tag, [...attr, ...properties], children);
    });

    // 如果需要處理 fill 屬性且沒有 g 標籤，則創建一個新的 g 標籤
    if (hasRootFill && !hasGGroup) {
        formattedContent = [
            createTag('g', ['fill="none"'], formattedContent)
        ];
    }

    return {
        viewBox,
        defs: defs.map(el => {
            const attr = objectKeys(el.attr).map(attrKey => formatAttrKeyValue(attrKey, el.attr[attrKey]));
            const children = el.children ? formatChildren(el.children, isMultiColor) : undefined;
            return createTag(el.tag, attr, children);
        }),
        content: formattedContent,
    };
}; 