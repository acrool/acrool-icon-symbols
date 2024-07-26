#!/usr/bin/env node
import {hideBin} from 'yargs/helpers';
import yargs from 'yargs/yargs';

module.exports = async function acroolScript () {
    yargs(hideBin(process.argv))
        .command('build-symbols [path] [idPrefix]', 'svg merge symbols', (yargs) => {
            return yargs
                .positional('path', {
                    describe: 'svg source path (ex: ./public/icon -> ./public/icon/_sources)',
                    default: './public/static/plugins/iconsvg',
                })
                .positional('idPrefix', {
                    describe: 'id prefix name (ex: icon_ -> icon_arrow_right)',
                    default: 'icon_',
                });
        }, (argv) => {
            const run = require('./build-symbols');
            run(argv);
        })

        .command('decode-iconfont [path]', 'svg merge symbols', (yargs) => {
            return yargs
                .positional('path', {
                    describe: 'iconfont path (ex: ./public/iconfont -> ./public/iconfont/iconfont.js)',
                    default: './public/static/plugins/iconfont',
                })
                .positional('idPrefix', {
                    describe: 'id prefix name (ex: icon_ -> icon_arrow_right)',
                    default: 'icon_',
                });

        }, (argv) => {
            const run = require('./decode-iconfont');
            run(argv);
        })

        .command('decode-symbols [path]', 'symbols split svg list', (yargs) => {
            return yargs
                .positional('path', {
                    describe: 'symbols path (ex: ./public/icon -> ./public/icon/index.svg)',
                    default: './public/static/plugins/iconsvg',
                })
                .positional('idPrefix', {
                    describe: 'id prefix name (ex: icon_ -> icon_arrow_right)',
                    default: 'icon_',
                });

        }, (argv) => {
            const run = require('./decode-symbols');
            run(argv);
        })
        .demandCommand(1)
        .parse();
};

