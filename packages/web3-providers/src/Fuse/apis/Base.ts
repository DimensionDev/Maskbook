import FuseLib from 'fuse.js'

export const Fuse = {
    create<T>(items: T[], options?: FuseLib.IFuseOptions<T>, index?: FuseLib.FuseIndex<T>) {
        return new FuseLib(items, options, index)
    },
}
