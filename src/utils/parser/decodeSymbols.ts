import {XMLParser} from 'fast-xml-parser';
import {TDecodeSymbols} from '../../types';

const xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    allowBooleanAttributes: true,
    parseTagValue: false,
    parseAttributeValue: false,
});

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