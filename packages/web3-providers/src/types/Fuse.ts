import type Fuse from 'fuse.js'

export namespace FuseAPI {
    export interface Provider<T> {
        getSearchableItems(getItems: () => Promise<T[]>): Promise<Fuse<T>>
    }
}
