# Acrool Icon Symbols


<a href="https://github.com/acrool/acrool-icon-symbols" title="Acrool Icon Symbols - Merge svg into svg symbols, and unpack svg symbols into individual svg">
    <img src="https://raw.githubusercontent.com/acrool/acrool-icon-symbols/refs/heads/main/public/og.png" alt="Acrool Icon Symbols Logo"/>
</a>


<p align="center">
   Merge svg into svg symbols, and unpack svg symbols into individual svg
</p>

<div align="center">


[![NPM](https://img.shields.io/npm/v/@acrool/icon-symbols.svg?style=for-the-badge)](https://www.npmjs.com/package/@acrool/icon-symbols)
[![npm](https://img.shields.io/bundlejs/size/@acrool/icon-symbols?style=for-the-badge)](https://github.com/acrool/@acrool/icon-symbols/blob/main/LICENSE)
[![npm](https://img.shields.io/npm/l/@acrool/icon-symbols?style=for-the-badge)](https://github.com/acrool/icon-symbols/blob/main/LICENSE)

[![npm downloads](https://img.shields.io/npm/dm/@acrool/icon-symbols.svg?style=for-the-badge)](https://www.npmjs.com/package/@acrool/icon-symbols)
[![npm](https://img.shields.io/npm/dt/@acrool/icon-symbols.svg?style=for-the-badge)](https://www.npmjs.com/package/@acrool/icon-symbols)

</div>

## Features

- Merge svg into svg symbols
- unpack svg symbols into individual svg
- Parse SVG content


## Install

```bash
yarn add @acrool/icon-symbols
```

## Use

```ts
import {decodeSvgPaths, decodeSymbols} from '@acrool/icon-symbols';

const fileContent = await fs.readFileSync(filePath);
const svg = decodeSvgPaths(fileContent.toString());

const symbols = decodeSymbols(fileContent.toString());

const newId = await this.iconSymbolService.create({
    code: file.filename.replace(/[ -]/g,'_').replace(/.svg$/,''),
    viewBox: svg.viewBox,
    content: svg.paths.join(''),
    iconDepotId,
    creatorId: currentMember.id,
});
```

## CLI Tools

- [acrool-icon-symbols-cli](https://github.com/acrool/acrool-icon-symbols-cli)

## License

MIT © [Acrool](https://github.com/acrool) & [Imagine](https://github.com/imagine10255)
