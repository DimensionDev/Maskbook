// ALL IMPORTS MUST BE DEFERRED
import type { DashboardRoutes } from '@masknet/shared-base'
import * as base from /* webpackDefer: true */ '@masknet/shared-base'

type DashboardRoutes_Welcome = DashboardRoutes.Welcome extends `${infer T}` ? T : never
function openWelcome() {
    const welcome: DashboardRoutes_Welcome = '/setup/welcome'
    browser.tabs.create({
        url: browser.runtime.getURL(`dashboard.html#${welcome}`),
    })
}

type DashboardRoutes_Permission = DashboardRoutes.Permissions extends `${infer T}` ? T : never
function openPermission() {
    const permissions: DashboardRoutes_Permission = '/setup/permissions'
    browser.tabs.create({
        url: browser.runtime.getURL(`dashboard.html#${permissions}`),
    })
}

browser.runtime.onInstalled.addListener(async (detail) => {
    if (detail.reason === 'install') {
        openWelcome()
    } else if (detail.reason === 'update') {
        const connect = await import('../../services/site-adaptors/connect.js')
        const groups = await connect.getOriginsWithoutPermission()
        if (groups.length) openPermission()
        const localStorage = (globalThis as any).localStorage
        if (localStorage) {
            const backupPassword = localStorage.getItem('backupPassword')
            if (backupPassword) {
                const backupMethod = localStorage.getItem('backupMethod')
                base.PersistentStorages.Settings.storage.backupConfig.setValue({
                    backupPassword,
                    email: localStorage.getItem('email'),
                    phone: localStorage.getItem('phone'),
                    cloudBackupAt: backupMethod && backupMethod === 'cloud' ? localStorage.getItem('backupAt') : null,
                    localBackupAt: backupMethod && backupMethod === 'local' ? localStorage.getItem('backupAt') : null,
                    cloudBackupMethod: null,
                })
            }
            // remove old data after migrate
            localStorage.removeItem('backupPassword')
            localStorage.removeItem('backupMethod')
            localStorage.removeItem('email')
            localStorage.removeItem('phone')
            localStorage.removeItem('backupAt')
        }
    }
})

browser.runtime.setUninstallURL('https://www.mask.io/feedback')
