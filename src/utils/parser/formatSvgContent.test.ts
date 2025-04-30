import {formatSvgContent} from './formatSvgContent';

describe('formatSvgContent', () => {
    it('單色SVG應該要直接去掉顏色 SVG', () => {
        const svgContent = `
                <svg viewBox="0 0 24 24">
                    <path d="M0 0L10 10" fill="#000000"/>
                </svg>
            `;
        const result = formatSvgContent(svgContent);
        expect(result).toEqual({
            viewBox: '0 0 24 24',
            defs: [],
            content: ['<path d="M0 0L10 10"/>']
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

    it('应该正确处理带有 stroke 属性的 SVG', () => {
        const svgContent = `
                <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="none">
                    <path
                        d="M10 2C8.52462 2 7.07798 2.408 5.82001 3.17888C4.56204 3.94976 3.54176 5.0535 2.87195 6.36808C2.20214 7.68265 1.9089 9.15684 2.02466 10.6277C2.14042 12.0985 2.66066 13.5087 3.52786 14.7023C4.39507 15.8959 5.57546 16.8264 6.93853 17.391C8.3016 17.9556 9.79426 18.1323 11.2515 17.9015C12.7087 17.6707 14.0737 17.0414 15.1956 16.0832C16.3175 15.1251 17.1525 13.8753 17.6085 12.4721"
                        stroke-width="1.3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            `;
        const result = formatSvgContent(svgContent);
        expect(result).toEqual({
            viewBox: '0 0 20 20',
            defs: [],
            content: [
                '<path d="M10 2C8.52462 2 7.07798 2.408 5.82001 3.17888C4.56204 3.94976 3.54176 5.0535 2.87195 6.36808C2.20214 7.68265 1.9089 9.15684 2.02466 10.6277C2.14042 12.0985 2.66066 13.5087 3.52786 14.7023C4.39507 15.8959 5.57546 16.8264 6.93853 17.391C8.3016 17.9556 9.79426 18.1323 11.2515 17.9015C12.7087 17.6707 14.0737 17.0414 15.1956 16.0832C16.3175 15.1251 17.1525 13.8753 17.6085 12.4721" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>'
            ]
        });
    });

    it('应该正确处理 SVG 标签带有 fill="none" 属性的情况', () => {
        const svgContent = `
                <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="none">
                    <path d="M10 2L18 10L10 18L2 10L10 2Z"/>
                </svg>
            `;
        const result = formatSvgContent(svgContent);
        expect(result).toEqual({
            viewBox: '0 0 20 20',
            defs: [],
            content: [
                '<g fill="none">',
                '<path d="M10 2L18 10L10 18L2 10L10 2Z"/>',
                '</g>'
            ]
        });
    });
});
