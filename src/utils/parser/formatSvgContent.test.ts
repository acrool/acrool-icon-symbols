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
                '<path d="M10 2L18 10L10 18L2 10L10 2Z"/>',
            ]
        });
    });

    it('应该正确处理 SVG 标签带有 fill="none" 属性, 並且 path 使用 stroke 的情况', () => {
        const svgContent = `
                <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="none">
                    <path d="M10 2L18 10L10 18L2 10L10 2Z" stroke="#fff"/>
                </svg>
            `;
        const result = formatSvgContent(svgContent);
        expect(result).toEqual({
            viewBox: '0 0 20 20',
            defs: [],
            content: [
                '<path d="M10 2L18 10L10 18L2 10L10 2Z" stroke="currentColor" fill="none"/>',
            ]
        });
    });


    it('应该正确处理带有 defs 的 SVG', () => {
        const svgContent = `
                <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#FF0000"/>
                            <stop offset="100%" stop-color="#00FF00"/>
                        </linearGradient>
                    </defs>
                    <path d="M10 2L18 10L10 18L2 10L10 2Z" fill="url(#gradient)"/>
                </svg>
            `;
        const result = formatSvgContent(svgContent);

        // 验证基本结构
        expect(result.viewBox).toBe('0 0 20 20');
        expect(result.defs).toHaveLength(4);
        expect(result.content).toHaveLength(1);

        // 获取生成的 ID
        const defsContent = result.defs?.[0] ?? '';
        const generatedId = defsContent.match(/id="([^"]+)"/)?.[1];
        expect(generatedId).toBeDefined();

        // 使用生成的 ID 构建预期的 defs 内容
        const expectedDefs = [
            `<linearGradient id="${generatedId}" x1="0%" y1="0%" x2="100%" y2="100%">`,
            '<stop offset="0%" stop-color="#FF0000"/>',
            '<stop offset="100%" stop-color="#00FF00"/>',
            '</linearGradient>'
        ];

        expect(result.defs).toEqual(expectedDefs);

        // 验证 content 内容
        const content = result.content?.[0] ?? '';
        const expectedContent = `<path d="M10 2L18 10L10 18L2 10L10 2Z" fill="url(#${generatedId})"/>`;
        expect(content).toBe(expectedContent);
    });
});
