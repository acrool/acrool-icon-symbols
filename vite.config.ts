import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
import {visualizer} from 'rollup-plugin-visualizer';
import eslint from 'vite-plugin-eslint';
import {viteCommonjs} from '@originjs/vite-plugin-commonjs';
import path from 'path';


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
            formats: ['es', 'cjs'],
            fileName: (format) => {
                if (format === 'es') return 'acrool-js-logger.mjs';
                if (format === 'cjs') return 'acrool-js-logger.cjs';
                return `acrool-js-logger.${format}.js`;
            }
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
