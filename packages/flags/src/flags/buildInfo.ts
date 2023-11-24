import { Environment, getEnvironment } from '@dimensiondev/holoflows-kit'
import { defer } from '@masknet/kit'

export interface BuildInfoFile {
    readonly BUILD_DATE?: string | undefined
    readonly VERSION?: string | undefined
    readonly COMMIT_HASH?: string | undefined
    readonly COMMIT_DATE?: string | undefined
    readonly BRANCH_NAME?: string | undefined
    readonly DIRTY?: boolean | undefined
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
let hasSetup = false
export let env: BuildInfoFile = {
    BUILD_DATE: process.env.BUILD_DATE,
    VERSION: process.env.VERSION,
    COMMIT_HASH: process.env.COMMIT_HASH,
    COMMIT_DATE: process.env.COMMIT_DATE,
    BRANCH_NAME: process.env.BRANCH_NAME,
    DIRTY: process.env.DIRTY,
    // REACT_DEVTOOLS_EDITOR_URL: string
    channel: process.env.CHANNEL,
}
const [_promise, resolve] = defer<void>()
export const buildInfoReadyPromise = _promise
export async function setupBuildInfo(): Promise<void> {
    return setupBuildInfoManually(await getBuildInfo())
}
export function setupBuildInfoManually(_env: BuildInfoFile) {
    if (hasSetup) return
    hasSetup = true
    env = _env
    resolve()
}
