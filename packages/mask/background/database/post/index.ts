export * from './type'
import { hasNativeAPI } from '../../../shared/native-rpc'

export const { createPostDB, updatePostDB, queryPostDB, queryPostsDB, queryPostPagedDB, withPostDBTransaction } =
    new Proxy({} as any as typeof import('./web'), {
        get(_, key) {
            return async function (...args: any) {
                if (hasNativeAPI) {
                    return import('./app').then((x) => (x as any)[key](...args))
                }

                return import('./web').then((x) => (x as any)[key](...args))
            }
        },
    })
