#!/usr/bin/env node

/* istanbul ignore if */
if (process.version.match(/v(\d+)\./)[1] < 10) {
    console.error('acrool-svg-symbols: Node v10 or greater is required. `acrool-svg-symbols` did not run.')
} else {
    const logger = require('../dist/lib/script/logger');
    const bearScript = require('../dist/lib/index');
    bearScript()
        .catch((e) => {
            logger.error(e.message);
            process.exit(1);
        });
}
