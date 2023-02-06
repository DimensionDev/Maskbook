import type { LoggerAPI } from '@masknet/web3-providers/types'

export let logger: Readonly<LoggerAPI.Logger | undefined>

export function initLogger(x?: LoggerAPI.Logger) {
    logger = x
}
