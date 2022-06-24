#!/usr/bin/env node

/* istanbul ignore if */
if (process.version.match(/v(\d+)\./)[1] < 10) {
    console.error('bear-icon-symbols: Node v10 or greater is required. `bear-icon-symbols` did not run.')
} else {
    const logger = require('../dist/script/logger');
    const bearScript = require('../dist/index');
    bearScript()
        .catch((e) => {
            logger.error(e.message);
            process.exit(1);
        });
}
