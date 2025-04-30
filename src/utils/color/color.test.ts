import {Node} from 'svg-parser';
import {checkIsSVGMultiColor} from './color';

describe('颜色处理模块测试', () => {
    describe('checkIsSVGMultiColor', () => {
        it('应该正确识别单色 SVG', () => {
            const svgNode: Array<Node | string> = [
                {
                    type: 'element',
                    tagName: 'path',
                    properties: {
                        fill: '#000000',
                        'fill-opacity': '1'
                    },
                    children: []
                }
            ];
            expect(checkIsSVGMultiColor(svgNode)).toBe(false);
        });

        it('应该正确识别多色 SVG', () => {
            const svgNode: Array<Node | string> = [
                {
                    type: 'element',
                    tagName: 'path',
                    properties: {
                        fill: '#000000',
                        'fill-opacity': '1'
                    },
                    children: []
                },
                {
                    type: 'element',
                    tagName: 'path',
                    properties: {
                        fill: '#FFFFFF',
                        'fill-opacity': '0.5'
                    },
                    children: []
                }
            ];
            expect(checkIsSVGMultiColor(svgNode)).toBe(true);
        });

        it('应该处理嵌套的 SVG 元素', () => {
            const svgNode: Array<Node | string> = [
                {
                    type: 'element',
                    tagName: 'g',
                    children: [
                        {
                            type: 'element',
                            tagName: 'path',
                            properties: {
                                fill: '#000000'
                            },
                            children: []
                        },
                        {
                            type: 'element',
                            tagName: 'path',
                            properties: {
                                fill: '#FFFFFF'
                            },
                            children: []
                        }
                    ],
                    properties: {}
                }
            ];
            expect(checkIsSVGMultiColor(svgNode)).toBe(true);
        });

        it('应该忽略非元素节点', () => {
            const svgNode: Array<Node | string> = [
                'text node',
                {
                    type: 'element',
                    tagName: 'path',
                    properties: {
                        fill: '#000000'
                    },
                    children: []
                }
            ];
            expect(checkIsSVGMultiColor(svgNode)).toBe(false);
        });
    });
});
