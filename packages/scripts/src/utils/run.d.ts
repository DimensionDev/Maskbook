export declare function shell(command: TemplateStringsArray, ...rest: string[]): import("child_process").ChildProcess;
export declare namespace shell {
    var cwd: (cwd: URL | string) => (command: TemplateStringsArray | string[], ...rest: string[]) => import("child_process").ChildProcess;
}
export declare function printShell(command: TemplateStringsArray, ...rest: string[]): void;
export declare namespace printShell {
    var cwd: (cwd: URL | string) => (command: TemplateStringsArray, ...rest: string[]) => void;
}
//# sourceMappingURL=run.d.ts.map