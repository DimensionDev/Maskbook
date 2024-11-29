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
export let env: BuildInfoFile = {
    channel: 'stable',
}
const [_promise, resolve] = defer<void>()
export const buildInfoReadyPromise = _promise
export async function setupBuildInfo(): Promise<void> {
    return setupBuildInfoManually({
        channel: 'stable',
    })
}
export function setupBuildInfoManually(_env: BuildInfoFile) {
    resolve()
    env = _env
}
