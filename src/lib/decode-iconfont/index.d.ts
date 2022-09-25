interface IArgs {
    path: string;
    idPrefix?: string;
}
/**
 * decode iconfont.js to _sources/svgs
 * reg: https://regex101.com/r/ai3qvO/1
 * @param args
 */
declare function run(args: IArgs): Promise<void>;
export default run;
