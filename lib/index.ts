#!/usr/bin/env node
import yargs from 'yargs/yargs';
import {hideBin} from 'yargs/helpers';

module.exports = async function bearScript () {
    yargs(hideBin(process.argv))
        .command('build-symbole [path] [idPrefix]', 'svg merge symbols', (yargs) => {
            return yargs
                .positional('path', {
                    describe: 'svg source path (ex: ./public/icon -> ./public/icon/_sources)',
                    default: './public/static/plugins/iconsvg',
                })
                .positional('idPrefix', {
                    describe: 'id prefix name (ex: icon -> icon-arrow-right)',
                    default: 'icon',
                });
        }, (argv) => {
            const run = require('./build-symbole');
            run(argv);
        })

        .command('decode-iconfont [path]', 'svg merge symbols', (yargs) => {
            return yargs
                .positional('path', {
                    describe: 'iconfont path (ex: ./public/iconfont -> ./public/iconfont/iconfont.js)',
                    default: './public/static/plugins/iconfont',
                })
                .positional('idPrefix', {
                    describe: 'id prefix name (ex: icon -> icon-arrow-right)',
                    default: 'icon',
                });

        }, (argv) => {
            const run = require('./decode-iconfont');
            run(argv);
        })
        .demandCommand(1)
        .parse();
};

