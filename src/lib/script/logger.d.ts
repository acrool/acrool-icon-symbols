declare const logger: {
    success: (...messages: Array<string>) => void;
    info: (...messages: Array<string>) => void;
    warn: (...messages: Array<string>) => void;
    error: (...messages: Array<string>) => void;
    debug: (...messages: Array<string>) => void;
    log: (...messages: Array<string>) => void;
    setVerbose: (level: boolean) => void;
    isVerbose: () => boolean;
    disable: () => void;
    enable: () => void;
};
export default logger;
