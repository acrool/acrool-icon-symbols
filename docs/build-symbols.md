# acrool-icon-symbols build-symbols

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

> if you need react component, you can use [bear-react-iconsvg](https://github.com/imagine10255/bear-react-iconsvg)

in your package.json
```json
{
  "scripts": {
    "build:icon": "acrool-icon-symbols build-symbols --path=./public/static/plugins/iconsvg"
  }
}
```

> source svg default in `_sources`

## run

```bash
$ yarn build:icon
```
