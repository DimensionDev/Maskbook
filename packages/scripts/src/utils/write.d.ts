export declare function changeFile(path: string | URL, f: (x: string) => string | Promise<string>): Promise<void>;
export declare namespace changeFile {
    var JSON: (path: string | URL, f: (x: any) => void) => Promise<void>;
    var typescript: (path: string | URL, f: (x: string) => string) => Promise<void>;
}
//# sourceMappingURL=write.d.ts.map