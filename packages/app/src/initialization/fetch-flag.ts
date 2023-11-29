import { startFetchRemoteFlag } from '@masknet/flags'

export function initFetchFlags() {
    startFetchRemoteFlag(startFetchRemoteFlag.io.localStorage)
}
