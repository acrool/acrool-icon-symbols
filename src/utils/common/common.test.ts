import {extractIdFromUrl, extractId, formatAttrKeyValue, createTag} from './common';

describe('通用工具函数测试', () => {
    describe('extractIdFromUrl', () => {
        it('应该从 URL 中提取 ID', () => {
            expect(extractIdFromUrl('url(#test-id)')).toBe('test-id');
            expect(extractIdFromUrl('url(#another-id)')).toBe('another-id');
        });

        it('应该处理无效的 URL 格式', () => {
            expect(extractIdFromUrl('not-a-url')).toBeUndefined();
            expect(extractIdFromUrl('url(no-id)')).toBeUndefined();
        });
    });

    describe('extractId', () => {
        it('应该从字符串中提取 ID 属性值', () => {
            expect(extractId('id="test-id"')).toBe('test-id');
            expect(extractId('id="another-id"')).toBe('another-id');
        });

        it('应该处理无效的 ID 格式', () => {
            expect(extractId('no-id-here')).toBeUndefined();
            expect(extractId('id=')).toBeUndefined();
        });
    });

    describe('formatAttrKeyValue', () => {
        it('应该正确格式化普通属性', () => {
            expect(formatAttrKeyValue('fill', '#000000')).toBe('fill="#000000"');
            expect(formatAttrKeyValue('strokeWidth', '2')).toBe('stroke-width="2"');
        });

        it('应该特殊处理 gradientUnits 属性', () => {
            expect(formatAttrKeyValue('gradientUnits', 'userSpaceOnUse')).toBe('gradientUnits="userSpaceOnUse"');
        });
    });

    describe('createTag', () => {
        it('应该创建不带子元素的标签', () => {
            expect(createTag('path', ['d="M0 0"', 'fill="#000"'])).toEqual(['<path d="M0 0" fill="#000"/>']);
        });

        it('应该创建带子元素的标签', () => {
            expect(createTag('g', ['id="group"'], ['<path d="M0 0"/>'])).toEqual([
                '<g id="group">',
                '<path d="M0 0"/>',
                '</g>'
            ]);
        });

        it('应该处理空属性数组', () => {
            expect(createTag('path', [])).toEqual(['<path />']);
        });

        it('应该处理空子元素数组', () => {
            expect(createTag('g', ['id="group"'], [])).toEqual(['<g id="group"/>']);
        });
    });
});
