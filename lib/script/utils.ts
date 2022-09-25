import {execSync} from 'child_process';
import {Node} from 'svg-parser';
import * as fs from 'fs';
const options = {stdio:[0, 1, 2]};

export const bash = (cmd: string) => {
    execSync(cmd, options);
};
