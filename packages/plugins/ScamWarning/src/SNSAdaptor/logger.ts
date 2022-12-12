import type { LogHubBase } from '@masknet/web3-providers/types'

export let logger: Readonly<LogHubBase | undefined>

export function initLogger(x?: LogHubBase) {
    logger = x
}
