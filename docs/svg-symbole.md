# bear-icon svg-symbols

> build svg icon merge symbols


## Setting 

in tsconfig.json
```json
{
  "compilerOptions": {},
  "files": [
    "public/static/plugins/iconsvg/icon.d.ts"
  ]
}
```

in react component
```typescript jsx
import styled, {css, keyframes} from 'styled-components/macro';
import {asset} from 'utils/config';

type sizeUnit = 'px'|'%'|'em';
type size = `${number}${sizeUnit}`;
interface IProps extends FCProps{
    onClick?: () => void;
    size?: size;
    color?: string|'primary'|'secondaryColor';
    code: IconCode;
    isRotateAnimation?: boolean;
    rotate?: number;
}



const idPrefix = 'icon';
const path = asset('/plugins/iconsvg/index.svg');

/**
 * Icon
 * https://github.com/Hiswe/gulp-svg-symbols
 * https://io-meter.com/img/posts/svg-icons.svg
 */
const IconSvg = ({
    style,
    className,
    onClick,
    size = '22px',
    color = '#bdbdbd',
    code,
    isRotateAnimation = false,
    rotate = 0,
}: IProps) => {
    const iconCode = [idPrefix, code].join('-');
    return (
        <IconSvgRoot
            xmlns="http://www.w3.org/2000/svg"
            style={style}
            className={className}
            isRotateAnimation={isRotateAnimation}
            onClick={onClick}
            size={size}
            rotate={rotate}
            color={color}
        >
            <use xlinkHref={`${path}#${iconCode}`}/>
        </IconSvgRoot>
    );
};

export default IconSvg;

const rotateAnimine = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const IconSvgRoot = styled.svg<{
    onClick: any,
    isRotateAnimation?: boolean,
    size?: size,
    rotate?: number,
}>`
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;

        color: ${props => props.color};
        width: ${props => props.size};
        height: ${props => props.size};

        vertical-align: middle;
        fill: currentColor;

        transform: rotate(${props => props.rotate}deg);

        ${props =>  props.isRotateAnimation && css`
            animation: ${rotateAnimine} 1s linear infinite;
        `}

`;
```

in your package.json
```json
{
  "scripts": {
    "build:icon": "bear-icon svg-symbols --path=./public/static/plugins/iconsvg",
    "build:icon-from-iconfont": "bear-icon svg-symbols:from-iconfont --path=./public/static/plugins/iconsvg/_sources"
  }
}
```

> source svg default in `_sources`

## run

```bash
$ yarn build:icon
```
