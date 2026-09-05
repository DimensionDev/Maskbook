import { type TaskFunction } from 'gulp';
import type { BuildFlagsExtended } from './flags.ts';
export declare function buildWebpackFlag(name: string, args: BuildFlagsExtended): () => Promise<number | void>;
export declare function buildRspackFlag(name: string, args: BuildFlagsExtended): () => Promise<number | void>;
export declare function buildExtensionFlag(name: string, args: BuildFlagsExtended): TaskFunction;
export declare function buildExtensionFlagRspack(name: string, args: BuildFlagsExtended): TaskFunction;
export declare const buildBaseExtension: TaskFunction;
export declare const buildBaseExtensionRspack: TaskFunction;
export declare function extensionWatch(f: (() => void) | BuildFlagsExtended): Promise<number | void>;
export declare function extensionWatchRspack(f: (() => void) | BuildFlagsExtended): Promise<number | void>;
//# sourceMappingURL=normal.d.ts.map