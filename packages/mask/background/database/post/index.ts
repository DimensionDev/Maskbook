export * from './type'
import { hasNativeAPI } from '../../../shared/native-rpc'

function assign(module: any) {
    ;({ createPostDB, updatePostDB, queryPostDB, queryPostsDB, queryPostPagedDB, withPostDBTransaction } = module)
    return module
}
export let { createPostDB, updatePostDB, queryPostDB, queryPostsDB, queryPostPagedDB, withPostDBTransaction } =
    new Proxy({} as any as typeof import('./web'), {
        get(_, key) {
            return async function (...args: any) {
                if (hasNativeAPI) {
                    return import('./app').then((module) => assign(module)[key](...args))
                }

                return import('./web').then((module) => assign(module)[key](...args))
            }
        },
    })
