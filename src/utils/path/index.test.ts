import {Node} from 'svg-parser';
import {remarkDeepSVGPaths} from './index';

describe('路径处理模块测试', () => {
    describe('remarkDeepSVGPaths', () => {
        it('应该正确处理单路径 SVG', () => {
            const svgNode: Array<Node | string> = [
                {
                    type: 'element',
                    tagName: 'path',
                    properties: {
                        d: 'M0 0L10 10',
                        fill: '#000000'
                    },
                    children: []
                }
            ];
            const result = remarkDeepSVGPaths(svgNode);
            expect(result).toEqual(['<path d="M0 0L10 10" fill="#000000"/>']);
        });

        it('应该处理多路径 SVG', () => {
            const svgNode: Array<Node | string> = [
                {
                    type: 'element',
                    tagName: 'path',
                    properties: {
                        d: 'M0 0L10 10',
                        fill: '#000000'
                    },
                    children: []
                },
                {
                    type: 'element',
                    tagName: 'path',
                    properties: {
                        d: 'M20 20L30 30',
                        fill: '#FFFFFF'
                    },
                    children: []
                }
            ];
            const result = remarkDeepSVGPaths(svgNode);
            expect(result).toEqual([
                '<path d="M0 0L10 10" fill="#000000"/>',
                '<path d="M20 20L30 30" fill="#FFFFFF"/>'
            ]);
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
                                d: 'M0 0L10 10',
                                fill: '#000000'
                            },
                            children: []
                        }
                    ],
                    properties: {}
                }
            ];
            const result = remarkDeepSVGPaths(svgNode);
            expect(result).toEqual(['<path d="M0 0L10 10" fill="#000000"/>']);
        });

        it('应该处理带透明度的路径', () => {
            const svgNode: Array<Node | string> = [
                {
                    type: 'element',
                    tagName: 'path',
                    properties: {
                        d: 'M0 0L10 10',
                        fill: '#000000',
                        'fill-opacity': '0.5'
                    },
                    children: []
                }
            ];
            const result = remarkDeepSVGPaths(svgNode);
            expect(result).toEqual(['<path d="M0 0L10 10" fill="#000000" fill-opacity="0.5"/>']);
        });

        it('应该忽略非路径元素', () => {
            const svgNode: Array<Node | string> = [
                {
                    type: 'element',
                    tagName: 'circle',
                    properties: {
                        cx: '10',
                        cy: '10',
                        r: '5'
                    },
                    children: []
                }
            ];
            const result = remarkDeepSVGPaths(svgNode);
            expect(result).toEqual([]);
        });
    });
});
