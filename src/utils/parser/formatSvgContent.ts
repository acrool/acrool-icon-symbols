import {objectKeys} from '@acrool/js-utils/object';
import {IFormatSvgContentRes} from '../../types';
import {decodeSvgContent} from './decodeSvgContent';
import {formatAttrKeyValue, createTag} from '../common';
import {formatSvgProperties} from '../path';
import {formatChildren, formatDefs} from './defs';


/**
 * 格式化 SVG 内容
 * @param svgContent - 原始 SVG 内容
 * @returns 包含格式化后的 viewBox、defs 和 content 的对象
 * @description
 * 1. 解析 SVG 内容并获取填充颜色、内容、定义和视口信息
 * 2. 判断是否为多色图标
 * 3. 格式化 SVG 内容，处理 fill 和 stroke 属性
 * 4. 如果需要，添加 g 标签包装
 */
export const formatSvgContent = (svgContent: string): IFormatSvgContentRes => {
    const {fillDiffColor, content, defs, fillNone, viewBox} = decodeSvgContent(svgContent);
    const uniqueColors = fillDiffColor.filter((c, i, arr) => c && arr.indexOf(c) === i);
    const isMultiColor = uniqueColors.length >= 2;

    // 檢查是否需要處理 fill 屬性
    const hasGGroup = content.some(el => el.tag === 'g');

    let formattedContent = content.flatMap(el => {
        const {fill, fillOpacity, stroke, ...pathAttr} = el.attr;
        const attr = objectKeys(pathAttr).map(attrKey => formatAttrKeyValue(attrKey, pathAttr[attrKey]));
        const properties = formatSvgProperties(el.attr, isMultiColor);
        const children = el.children ? formatChildren(el.children, isMultiColor) : undefined;

        // 如果是 g 标签且有 fill="none"，直接添加 fill="none" 属性
        if (el.tag === 'g' && fillNone) {
            return createTag(el.tag, [...attr, 'fill="none"'], children);
        }

        return createTag(el.tag, [...attr, ...properties], children);
    });

    // 如果需要處理 fill 屬性且沒有 g 標籤，則創建一個新的 g 標籤
    if (fillNone && !hasGGroup) {
        formattedContent = createTag('g', ['fill="none"'], formattedContent);
    }

    return {
        viewBox,
        defs: formatDefs(defs, isMultiColor),
        content: formattedContent,
    };
};
