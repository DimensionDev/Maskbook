// DO NOT ADD ANY IMPORT HERE
// We need to avoid Top Level Await in this file.
import type { Runtime } from 'webextension-polyfill'

async function openWelcome() {
    const { DashboardRoutes } = await import('@masknet/shared-base')
    browser.tabs.create({
        url: browser.runtime.getURL(`dashboard.html#${DashboardRoutes.Welcome}`),
    })
}

const onInstalled = async (detail: Runtime.OnInstalledDetailsType) => {
    if (detail.reason === 'install') openWelcome()
    else if (detail.reason === 'update') {
        const { getOriginsWithoutPermission } = await import('../../services/site-adaptors/connect.js')
        const groups = await getOriginsWithoutPermission()
        if (groups.length) openWelcome()
    }
}
browser.runtime.onInstalled.addListener(onInstalled)
