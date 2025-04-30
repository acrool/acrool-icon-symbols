import {lowerCaseToLowerDashCase} from '@acrool/js-utils/string';

/**
 * 从 URL 字符串中提取 ID
 * @param input - 包含 URL 的字符串，格式如 "url(#id)"
 * @returns 提取出的 ID 或 undefined
 */
export const extractIdFromUrl = (input: string): string | undefined => {
    const regex = /url\(#([^)]+)\)/;
    const match = input.match(regex);
    return match ? match[1] : undefined;
};

/**
 * 从字符串中提取 ID 属性值
 * @param input - 包含 id 属性的字符串，格式如 'id="value"'
 * @returns 提取出的 ID 值或 undefined
 */
export const extractId = (input: string): string | undefined => {
    const regex = /id="([^"]+)"/;
    const match = input.match(regex);
    return match ? match[1] : undefined;
};

/**
 * 格式化属性键值对
 * @param key - 属性名
 * @param value - 属性值
 * @returns 格式化后的属性字符串
 */
export const formatAttrKeyValue = (key: string, value: any) =>
    key === 'gradientUnits' ? `${key}="${value}"` : `${lowerCaseToLowerDashCase(key)}="${value}"`;

/**
 * 创建 HTML/SVG 标签字符串
 * @param tag - 标签名
 * @param attributes - 属性数组
 * @param children - 子元素数组（可选）
 * @returns 格式化后的标签字符串数组
 */
export const createTag = (tag: string, attributes: string[], children?: string[]) => {
    if (children && children.length > 0) {
        return [
            `<${tag} ${attributes.join(' ')}>`,
            ...children,
            `</${tag}>`
        ];
    }
    return [`<${tag} ${attributes.join(' ')}/>`];
};
