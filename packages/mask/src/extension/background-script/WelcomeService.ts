import type { DashboardRoutes } from '@masknet/shared-base'

import { assertEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import './legacy'

export {
    mobile_generateBackupJSON,
    mobile_generateBackupJSONOnlyForPersona,
    generateBackupPreviewInfo,
    createBackupFile,
} from '../../../background/services/backup/create'
export {
    addUnconfirmedBackup,
    getUnconfirmedBackup,
    restoreUnconfirmedBackup,
    mobile_restoreFromBase64,
} from '../../../background/services/backup/restore'

assertEnvironment(Environment.ManifestBackground)

export async function openOptionsPage(route?: DashboardRoutes, search?: string) {
    return browser.tabs.create({
        active: true,
        url: browser.runtime.getURL(`/dashboard.html#${route}${search ? `?${search}` : ''}`),
    })
}

export { createPersonaByMnemonic } from '../../database'
