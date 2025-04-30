import {decodeSvgContent} from './decodeSvgContent';

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
            fillNone: false,
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
        expect(result.fillNone).toBe(false);
    });

    it('应该检测 SVG 的 fill="none" 属性', () => {
        const svgContent = `
            <svg viewBox="0 0 24 24" fill="none">
                <path d="M0 0L10 10"/>
            </svg>
        `;
        const result = decodeSvgContent(svgContent);
        expect(result.fillNone).toBe(true);
    });
}); 