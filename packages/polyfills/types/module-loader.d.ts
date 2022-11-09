declare function __mask__module__define__(
    id: string,
    module: import('../../sandboxed-plugin-runtime/node_modules/@masknet/compartment').VirtualModuleRecord,
): void
declare function __mask__module__reflection__(
    specifier: string,
): Promise<import('../../sandboxed-plugin-runtime/node_modules/@masknet/compartment').VirtualModuleRecord>
