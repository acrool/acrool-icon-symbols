interface IArgs {
    path: string;
    idPrefix?: string;
}
declare function run(args: IArgs): Promise<void>;
export default run;
