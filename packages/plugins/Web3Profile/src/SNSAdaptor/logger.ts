import type { LogHubBase } from '@masknet/shared-base'

export let logger: Readonly<LogHubBase>

export function initLogger(x: LogHubBase) {
    logger = x
}
