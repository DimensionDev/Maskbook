import type { Configuration } from 'webpack';
export declare const ManifestFile: {
    ChromiumMV3: string;
    ChromiumBetaMV3: string;
    FirefoxMV3: string;
    SafariMV3: string;
};
export type ManifestFile = (typeof ManifestFile)[keyof typeof ManifestFile];
export interface BuildFlags {
    /** If this field is set, manifest.json will copy the content of manifest-*.json */
    manifestFile?: ManifestFile;
    mode: 'development' | 'production';
    /** @default 'stable' */
    channel?: 'stable' | 'beta' | 'insider';
    /** @default false */
    profiling?: boolean;
    /** @default true in development */
    hmr?: boolean;
    /** @default true in development and hmr is true */
    reactRefresh?: boolean;
    /** @default false */
    reactCompiler?: boolean | 'infer' | 'annotation' | 'all';
    /** @default false */
    lavamoat?: boolean;
    /** @default false */
    csp?: boolean;
    outputPath?: string;
    /** @default true */
    devtools?: boolean;
    /** @default "vscode://file/{path}:{line}" */
    devtoolsEditorURI?: string;
    /** @default true */
    sourceMapPreference?: boolean | string;
    /** @default true */
    sourceMapHideFrameworks?: boolean | undefined;
    FIREFLY_X_CLIENT_ID?: string;
    FIREFLY_X_CLIENT_SECRET?: string;
}
export type NormalizedFlags = Required<BuildFlags>;
export declare function normalizeBuildFlags(flags: BuildFlags): NormalizedFlags;
export interface ComputedFlags {
    sourceMapKind: Configuration['devtool'];
    reactProductionProfiling: boolean;
}
export declare function computedBuildFlags(flags: Pick<Required<BuildFlags>, 'mode' | 'sourceMapPreference' | 'profiling' | 'manifestFile' | 'devtools'>): ComputedFlags;
export declare function computeCacheKey(flags: Required<BuildFlags>, computedFlags: ComputedFlags): string;
//# sourceMappingURL=flags.d.ts.map