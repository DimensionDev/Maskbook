import type { LogHubBase } from '@masknet/web3-providers'

export let logger: Readonly<LogHubBase | undefined>

export function initLogger(x?: LogHubBase) {
    logger = x
}
