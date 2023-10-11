import type Fuse from 'fuse.js'

export namespace FuseBaseAPI {
    export interface Provider {
        create<T>(items: T[], options?: Fuse.IFuseOptions<T>, index?: Fuse.FuseIndex<T>): Fuse<T>
    }
}
