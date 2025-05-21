import {objectKeys} from '@acrool/js-utils/object';

import {IFormatSvgContentRes} from '../../types';
import {createTag,formatAttrKeyValue} from '../common';
import {formatSvgProperties} from '../path';
import {SVG_ATTR_WHITELIST} from './config';
import {decodeSvgContent} from './decodeSvgContent';
import {formatChildren, formatDefs} from './defs';


/**
 * 格式化 SVG 内容
 * @param svgContent - 原始 SVG 内容
 * @returns 包含格式化后的 viewBox、defs 和 content 的对象
 * @description
 * 1. 解析 SVG 内容并获取填充颜色、内容、定义和视口信息
 * 2. 判断是否为多色图标
 * 3. 格式化 SVG 内容，处理 fill 和 stroke 属性
 * 4. 如果 fillNone 为 true 且 path 使用 stroke，则添加 fill="none" 属性
 */
export const formatSvgContent = (svgContent: string): IFormatSvgContentRes => {
    const {fillDiffColor, content, defs, fillNone, viewBox} = decodeSvgContent(svgContent);
    const uniqueColors = fillDiffColor.filter((c, i, arr) => c && arr.indexOf(c) === i);
    const isMultiColor = uniqueColors.length >= 2;

    const formattedContent = content.flatMap(el => {
        const {fill, fillOpacity, stroke, ...pathAttr} = el.attr;
        // 只保留白名單屬性
        const attr = objectKeys(pathAttr)
            .filter(attrKey => SVG_ATTR_WHITELIST.includes(String(attrKey)))
            .map(attrKey => formatAttrKeyValue(attrKey, pathAttr[attrKey]));
        const properties = formatSvgProperties(el.attr, isMultiColor);
        const children = el.children ? formatChildren(el.children, isMultiColor) : undefined;

        // 如果是 path 标签，使用 stroke，且 fillNone 为 true，则添加 fill="none"
        if (el.tag === 'path' && stroke && fillNone) {
            return createTag(el.tag, [...attr, ...properties, 'fill="none"'], children);
        }

        return createTag(el.tag, [...attr, ...properties], children);
    });

    return {
        viewBox,
        defs: formatDefs(defs, isMultiColor),
        content: formattedContent,
    };
};
