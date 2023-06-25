import { memoize } from 'lodash-es'

export interface BuildInfoFile {
    readonly BUILD_DATE: string
    readonly VERSION: string
    readonly COMMIT_HASH: string
    readonly COMMIT_DATE: string
    readonly BRANCH_NAME: string
    readonly DIRTY?: boolean
    readonly REACT_DEVTOOLS_EDITOR_URL?: string
}

async function getBuildInfoRaw(): Promise<BuildInfoFile> {
    try {
        const response = await fetch((globalThis as any).browser.runtime.getURL('/build-info.txt'))
        const env: BuildInfoFile = await response.json()
        return env
    } catch {
        return {
            BRANCH_NAME: 'missing',
            BUILD_DATE: 'missing',
            COMMIT_DATE: 'missing',
            COMMIT_HASH: 'missing',
            VERSION: 'missing',
        }
    }
}
export const getBuildInfo: typeof getBuildInfoRaw = memoize(getBuildInfoRaw)
