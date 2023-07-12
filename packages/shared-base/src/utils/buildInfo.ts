import { memoize } from 'lodash-es'
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

async function getBuildInfoRaw(): Promise<BuildInfoFile> {
    try {
        const response =
            // eslint-disable-next-line no-bitwise
            await (getEnvironment() & Environment.HasBrowserAPI
                ? fetch('/build-info.json')
                : fetch((globalThis as any).browser.runtime.getURL('/build-info.json')))
        const env: BuildInfoFile = await response.json()
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
export const getBuildInfo: typeof getBuildInfoRaw = memoize(getBuildInfoRaw)
