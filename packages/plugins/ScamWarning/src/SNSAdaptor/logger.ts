import type { LogHubBaseAPI } from '@masknet/web3-providers/types'

export let logger: Readonly<LogHubBaseAPI.Logger | undefined>

export function initLogger(x?: LogHubBaseAPI.Logger) {
    logger = x
}
