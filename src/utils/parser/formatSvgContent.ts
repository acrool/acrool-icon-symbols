import {objectKeys} from '@acrool/js-utils/object';
import {IDef, TFormatSvgContent} from '../../types';
import {decodeSvgContent} from './decodeSvgContent';
import {formatAttrKeyValue, createTag} from '../common';
import {formatSvgProperties} from '../path/path';

/**
 * 格式化 SVG 子元素的属性
 * @param children - SVG 子元素数组
 * @param isMultiColor - 是否为多色图标
 * @returns 格式化后的子元素字符串数组
 */
const formatChildren = (children: IDef[], isMultiColor: boolean): string[] => {
    return children.map(childEl => {
        const {fillOpacity, stroke, ...pathAttr} = childEl.attr;
        const childAttr = objectKeys(pathAttr).map(attrKey => formatAttrKeyValue(attrKey, pathAttr[attrKey]));
        const childProperties = formatSvgProperties(childEl.attr, isMultiColor);
        return `<${childEl.tag} ${[...childAttr, ...childProperties].join(' ')}/>`;
    });
};

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
        const properties = formatSvgProperties(el.attr, isMultiColor);
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