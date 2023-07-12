import { Environment, getEnvironment } from '@dimensiondev/holoflows-kit'

export interface BuildInfoFile {
    readonly BUILD_DATE: string
    readonly VERSION: string
    readonly COMMIT_HASH: string
    readonly COMMIT_DATE: string
    readonly BRANCH_NAME: string
    readonly DIRTY?: boolean
    readonly REACT_DEVTOOLS_EDITOR_URL?: string
    readonly channel: 'stable' | 'beta' | 'insider'
}

async function getBuildInfo(): Promise<BuildInfoFile> {
    try {
        // eslint-disable-next-line no-bitwise
        const hasBrowserAPI = getEnvironment() & Environment.HasBrowserAPI
        const b = (globalThis as any).browser
        const manifestVersion = hasBrowserAPI ? b.runtime.getManifest().version : undefined
        const response = await fetch(hasBrowserAPI ? b.runtime.getURL('/build-info.json') : '/build-info.json')
        const env: BuildInfoFile = await response.json()
        if (manifestVersion) Object.assign(env.VERSION, { VERSION: manifestVersion })
        Object.freeze(env)
        return env
    } catch {
        return {
            channel: 'stable',
            BRANCH_NAME: 'N/A',
            BUILD_DATE: 'N/A',
            COMMIT_DATE: 'N/A',
            COMMIT_HASH: 'N/A',
            VERSION: 'N/A',
        }
    }
}
export const env = await getBuildInfo()
