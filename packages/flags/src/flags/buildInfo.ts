import { Environment, getEnvironment } from '@dimensiondev/holoflows-kit'
import { defer } from '@masknet/kit'

export interface BuildInfoFile {
    readonly BUILD_DATE?: string | undefined
    readonly VERSION?: string | undefined
    readonly COMMIT_HASH?: string | undefined
    readonly COMMIT_DATE?: string | undefined
    readonly BRANCH_NAME?: string | undefined
    readonly DIRTY?: boolean
    readonly REACT_DEVTOOLS_EDITOR_URL?: string
    readonly channel: 'stable' | 'beta' | 'insider'
}

export async function getBuildInfo(): Promise<BuildInfoFile> {
    try {
        // eslint-disable-next-line no-bitwise
        const hasBrowserAPI = getEnvironment() & Environment.HasBrowserAPI
        const b = (globalThis as any).browser
        const manifestVersion = hasBrowserAPI ? b.runtime.getManifest().version : undefined
        const response = await fetch(hasBrowserAPI ? b.runtime.getURL('/build-info.json') : '/build-info.json')
        const env: BuildInfoFile = await response.json()
        if (manifestVersion) Object.assign(env, { VERSION: manifestVersion })
        Object.freeze(env)
        return env
    } catch {
        return {
            channel: 'stable',
        }
    }
}
export let env: BuildInfoFile
const [_promise, resolve] = defer<void>()
export const envReadyPromise = _promise
export function setup() {
    return getBuildInfo().then(setEnv)
}
export function setEnv(_env: BuildInfoFile) {
    if (env) return
    resolve()
    env = _env
}
