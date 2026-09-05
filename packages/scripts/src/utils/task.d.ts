import { type TaskFunction } from 'gulp';
export declare function task<T extends TaskFunction>(f: T, name: string, description: string, flags?: TaskFunction['flags']): T;
export declare function watchTask(build: TaskFunction, dev: TaskFunction, name: string, description: string, flags?: TaskFunction['flags']): void;
/** Generate Task and Task-Watch from npm scripts (`npm start` and `npm build`) */
export declare function fromNPMTask(baseDir: URL, name: string, description: string): [build: () => Promise<number>, watch: () => Promise<void>];
export declare function awaitTask(taskFunction: TaskFunction): Promise<void>;
//# sourceMappingURL=task.d.ts.map