// ALL IMPORTS MUST BE DEFERRED
import type { DashboardRoutes } from '@masknet/shared-base'
import * as connect /* webpackDefer: true */ from '../../services/site-adaptors/connect.js'

type DashboardRoutes_Welcome = DashboardRoutes.Welcome extends `${infer T}` ? T : never
function openWelcome() {
    const welcome: DashboardRoutes_Welcome = '/setup/welcome'
    browser.tabs.create({
        url: browser.runtime.getURL(`dashboard.html#${welcome}`),
    })
}

browser.runtime.onInstalled.addListener(async (detail) => {
    if (detail.reason === 'install') {
        openWelcome()
    } else if (detail.reason === 'update') {
        const groups = await connect.getOriginsWithoutPermission()
        if (groups.length) openWelcome()
    }
})
