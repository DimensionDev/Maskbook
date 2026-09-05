import type { ChildProcess } from 'node:child_process';
import { type TaskFunction } from 'gulp';
export declare function cleanupWhenExit(): void;
export declare function markTaskNeedCleanup(task: TaskFunction): TaskFunction;
export declare function markChildProcess(child: ChildProcess): void;
//# sourceMappingURL=exit.d.ts.map