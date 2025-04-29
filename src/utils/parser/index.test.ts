import {decodeSymbols, decodeSvgContent, formatSvgContent} from './index';

describe('解析器模块测试', () => {
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

    describe('decodeSvgContent', () => {
        it('应该正确解析简单的 SVG', () => {
            const svgContent = `
                <svg viewBox="0 0 24 24">
                    <path d="M0 0L10 10" fill="#000000"/>
                </svg>
            `;
            const result = decodeSvgContent(svgContent);
            expect(result).toEqual({
                fillDiffColor: ['#000000'],
                viewBox: '0 0 24 24',
                content: [
                    {
                        tag: 'path',
                        attr: {
                            d: 'M0 0L10 10',
                            fill: '#000000'
                        }
                    }
                ],
                defs: []
            });
        });

        it('应该处理带 defs 的 SVG', () => {
            const svgContent = `
                <svg viewBox="0 0 24 24">
                    <defs>
                        <linearGradient id="gradient">
                            <stop offset="0%" stop-color="#000000"/>
                        </linearGradient>
                    </defs>
                    <path d="M0 0L10 10" fill="url(#gradient)"/>
                </svg>
            `;
            const result = decodeSvgContent(svgContent);
            expect(result.defs).toHaveLength(1);
            expect(result.defs[0].tag).toBe('linearGradient');
        });
    });

    describe('formatSvgContent', () => {
        it('应该正确格式化单色 SVG', () => {
            const svgContent = `
                <svg viewBox="0 0 24 24">
                    <path d="M0 0L10 10" fill="#000000"/>
                </svg>
            `;
            const result = formatSvgContent(svgContent);
            expect(result).toEqual({
                viewBox: '0 0 24 24',
                defs: [],
                content: ['<path d="M0 0L10 10" fill="#000000" stroke="currentColor"/>']
            });
        });

        it('应该正确格式化多色 SVG', () => {
            const svgContent = `
                <svg viewBox="0 0 24 24">
                    <path d="M0 0L10 10" fill="#000000"/>
                    <path d="M20 20L30 30" fill="#FFFFFF"/>
                </svg>
            `;
            const result = formatSvgContent(svgContent);
            if (result.content) {
                expect(result.content).toHaveLength(2);
                expect(result.content[0]).toContain('fill="#000000"');
                expect(result.content[1]).toContain('fill="#FFFFFF"');
            }
        });
    });
});
