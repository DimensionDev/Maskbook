import Fuse from 'fuse.js'
import type { FuseBaseAPI } from '../../entry-types.js'

export class FuseAPI implements FuseBaseAPI.Provider {
    create<T>(items: T[], options?: Fuse.IFuseOptions<T>, index?: Fuse.FuseIndex<T>) {
        return new Fuse(items, options, index)
    }
}
