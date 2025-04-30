import {XMLParser} from 'fast-xml-parser';
import {TDecodeSymbols} from '../../types';

const xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    allowBooleanAttributes: true,
    parseTagValue: false,
    parseAttributeValue: false,
});

/**
 * 解析 SVG symbols 内容并提取图标信息
 * @param {string} symbolsContent - SVG symbols 标签的 XML 内容
 * @returns {Array<{code: string, viewBox: string, content: string}>} 返回解析后的图标数据数组
 * @description
 * 该函数会：
 * 1. 解析传入的 SVG symbols XML 内容
 * 2. 提取每个 symbol 标签的信息
 * 3. 对每个 symbol 提取其 id、viewBox 和内容
 * 4. 返回包含所有图标信息的数组
 */
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