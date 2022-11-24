import { LogHub, LogHubBase, LogPlatform } from '@masknet/shared-base'

export let logger: Readonly<LogHubBase>

export function initLogger() {
    logger = new LogHub(LogPlatform.Popup)
}
