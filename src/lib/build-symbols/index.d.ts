interface IArgs {
    path: string;
    idPrefix?: string;
}
/**
 * reg: https://regex101.com/r/ai3qvO/1
 */
declare function run(args: IArgs): Promise<void>;
export default run;
