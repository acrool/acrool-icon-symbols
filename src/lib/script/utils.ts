import {execSync} from 'child_process';
import * as fs from 'fs';
import {numToDecimal2} from '../../utils';

const options = {stdio:[0, 1, 2]};

export const bash = (cmd: string) => {
    execSync(cmd, options);
};



export const getFilesizeInBytes = (filename: string): string => {
    const stats = fs.statSync(filename);
    const fileSizeInBytes = stats.size;
    return `${numToDecimal2(fileSizeInBytes / 1024)} kB`;
};
