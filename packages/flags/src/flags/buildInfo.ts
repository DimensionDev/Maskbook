import { Environment, isEnvironment } from '@dimensiondev/holoflows-kit'

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
        const hasBrowserAPI = isEnvironment(Environment.HasBrowserAPI)
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
export let env: BuildInfoFile = {
    channel: 'stable',
}
const { promise, resolve } = Promise.withResolvers<void>()
export const buildInfoReadyPromise = promise
export async function setupBuildInfo(): Promise<void> {
    return setupBuildInfoManually(await getBuildInfo())
}
export function setupBuildInfoManually(_env: BuildInfoFile) {
    resolve()
    env = _env
}
