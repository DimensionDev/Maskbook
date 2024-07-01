import { setupServer } from 'msw/node'
import { BundlerHandlers } from './handlers/SmartPayBundler.js'
import { DSearchHandlers } from './handlers/DSearch.js'
import { setupBuildInfoManually } from '../flags/src/flags/buildInfo.js'
import 'core-js'
setupBuildInfoManually({
    channel: 'stable',
})

globalThis.localStorage = (() => {
    const map = new Map()

    return {
        getItem(key: string) {
            return map.get(key)
        },
        setItem(key: string, value: unknown) {
            map.set(key, value)
        },
        removeItem(key: string) {
            map.delete(key)
        },
        clear() {
            map.clear()
        },
        key(index: number) {
            // TODO: implement it when we need it.
            return ''
        },
        get length() {
            return map.size
        },
    }
})()

Object.assign(globalThis, {
    location: new URL('https://example.com'),
    screen: {
        width: 0,
        height: 0,
    } as Screen,
})

const server = setupServer(...BundlerHandlers, ...DSearchHandlers)
server.listen({ onUnhandledRequest: 'error' })
