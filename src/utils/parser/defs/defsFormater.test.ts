import {formatDefs} from './defsFormater';

describe('defsFormater', () => {
    it('应该正确处理简单的 defs', () => {
        const defs = [{
            tag: 'linearGradient',
            attr: {
                id: 'gradient',
                x1: '0',
                y1: '0',
                x2: '1',
                y2: '1'
            },
            children: [{
                tag: 'stop',
                attr: {
                    offset: '0%',
                    'stop-color': '#000000'
                }
            }]
        }];

        const result = formatDefs(defs);
        expect(result).toEqual([
            '<linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">',
            '<stop offset="0%" stop-color="#000000"/>',
            '</linearGradient>'
        ]);
    });

    it('应该处理多个 defs 元素', () => {
        const defs = [
            {
                tag: 'linearGradient',
                attr: {id: 'grad1'},
                children: [{
                    tag: 'stop',
                    attr: {offset: '0%', 'stop-color': '#000'}
                }]
            },
            {
                tag: 'linearGradient',
                attr: {id: 'grad2'},
                children: [{
                    tag: 'stop',
                    attr: {offset: '0%', 'stop-color': '#fff'}
                }]
            }
        ];

        const result = formatDefs(defs);
        expect(result).toHaveLength(6); // 两个 gradient 各占 3 行
    });
}); 