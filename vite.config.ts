import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
import glob from 'fast-glob';
import {visualizer} from 'rollup-plugin-visualizer';
import eslint from 'vite-plugin-eslint';
import {viteCommonjs} from '@originjs/vite-plugin-commonjs';
import path from 'path';

// libraries
const files = glob.sync(['./src/**/index.ts'])
    .map(file => {
        const key = file.match(/(?<=\.\/src\/).*(?=\.ts)/);
        return [key[0], file];
    });
const entries = Object.fromEntries(files);

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        eslint(),
        viteCommonjs(),
        dts({
            insertTypesEntry: true,
        }),
        visualizer() as Plugin,
    ],
    build: {
        sourcemap: process.env.NODE_ENV !== 'production',
        outDir: 'dist',
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'AcroolIconSymbols',
            formats: ['es', 'umd'],
            fileName: (format) => `acrool-svg-symbols.${format}.js`,
        },
        rollupOptions: {
            external: ['y18n'],
        },
    },
    resolve: {
        alias: {
            'y18n': path.resolve(__dirname, 'node_modules/y18n/build/lib/platform-shims/browser.js'),
        },
    },
});
