import {decodeSymbols} from './decodeSymbols';

describe('decodeSymbols', () => {
    it('应该正确解析单个 symbol', () => {
        const symbolsContent = `
            <symbol id="icon_test">
                <path d="M0 0L10 10"/>
            </symbol>
        `;
        const result = decodeSymbols(symbolsContent);
        expect(result).toEqual([
            {
                code: 'test',
                viewBox: '0 0 1024',
                content: '<path d="M0 0L10 10"/>'
            }
        ]);
    });

    it('应该正确解析多个 symbols', () => {
        const symbolsContent = `
            <symbol id="icon_test1">
                <path d="M0 0L10 10"/>
            </symbol>
            <symbol id="icon_test2">
                <path d="M20 20L30 30"/>
            </symbol>
        `;
        const result = decodeSymbols(symbolsContent);
        expect(result).toEqual([
            {
                code: 'test1',
                viewBox: '0 0 1024',
                content: '<path d="M0 0L10 10"/>'
            },
            {
                code: 'test2',
                viewBox: '0 0 1024',
                content: '<path d="M20 20L30 30"/>'
            }
        ]);
    });
}); 