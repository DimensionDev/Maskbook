import type { Runtime } from 'webextension-polyfill'
import { DashboardRoutes } from '@masknet/shared-base'
import { hmr } from '../../../utils-pure/index.js'

function openWelcome() {
    browser.tabs.create({
        url: browser.runtime.getURL(`dashboard.html#${DashboardRoutes.Welcome}`),
    })
}

const { signal } = hmr(import.meta.webpackHot)
const onInstalled = async (detail: Runtime.OnInstalledDetailsType) => {
    if (detail.reason === 'install') openWelcome()
    else if (detail.reason === 'update') {
        const { getOriginsWithoutPermission } = await import('../../services/site-adaptors/connect.js')
        const groups = await getOriginsWithoutPermission()
        if (groups.length) openWelcome()
    }
}
browser.runtime.onInstalled.addListener(onInstalled)
signal.addEventListener('abort', () => {
    browser.runtime.onInstalled.removeListener(onInstalled)
})
