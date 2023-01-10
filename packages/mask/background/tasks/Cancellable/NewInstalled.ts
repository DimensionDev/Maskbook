import { DashboardRoutes } from '@masknet/shared-base'
import type { Runtime } from 'webextension-polyfill'
import { Flags } from '../../../shared/flags.js'
import { hmr } from '../../../utils-pure/index.js'
import { getOriginsWithoutPermission } from '../../services/site-adaptors/connect.js'

function openWelcome() {
    browser.tabs.create({
        url: browser.runtime.getURL(`dashboard.html#${DashboardRoutes.Welcome}`),
    })
}

const { signal } = hmr(import.meta.webpackHot)
const onInstalled = async (detail: Runtime.OnInstalledDetailsType) => {
    if (Flags.has_native_welcome_ui) return
    if (detail.reason === 'install') openWelcome()
    else if (detail.reason === 'update') {
        const groups = await getOriginsWithoutPermission()
        if (groups.length) openWelcome()
    }
}
browser.runtime.onInstalled.addListener(onInstalled)
signal.addEventListener('abort', () => {
    browser.runtime.onInstalled.removeListener(onInstalled)
})
