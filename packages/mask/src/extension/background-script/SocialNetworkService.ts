import { definedSocialNetworkUIs, getNetworkWorker, loadSocialNetworkUI } from '../../social-network'
import { Flags } from '../../../shared'
import { requestSNSAdaptorPermission } from '../../social-network/utils/permissions'

import { currentSetupGuideStatus } from '../../settings/settings'
import stringify from 'json-stable-stringify'
import { SetupGuideStep } from '../../components/InjectedComponents/SetupGuide'
import { PersonaIdentifier, delay } from '@masknet/shared-base'

export async function getDefinedSocialNetworkUIs() {
    return [...definedSocialNetworkUIs.values()].map(({ networkIdentifier }) => {
        return {
            networkIdentifier,
        }
    })
}
export async function connectSocialNetwork(identifier: PersonaIdentifier, network: string) {
    const ui = await loadSocialNetworkUI(network)
    const home = ui.utils.getHomePage?.()
    if (!Flags.no_web_extension_dynamic_permission_request) {
        if (!(await requestSNSAdaptorPermission(ui))) return
    }
    currentSetupGuideStatus[network].value = stringify({
        status: SetupGuideStep.FindUsername,
        persona: identifier.toText(),
    })
    await delay(100)
    home && browser.tabs.create({ active: true, url: home })
}

export async function openProfilePage(network: string, userId?: string) {
    const ui = await loadSocialNetworkUI(network)
    const profile = ui.utils.getProfilePage?.(userId)
    if (!Flags.no_web_extension_dynamic_permission_request) {
        if (!(await requestSNSAdaptorPermission(ui))) return
    }
    await delay(100)
    profile && browser.tabs.create({ active: true, url: profile })
}

export async function openShareLink(SNSIdentifier: string, post: string) {
    const url = (await getNetworkWorker(SNSIdentifier)).utils.getShareLinkURL?.(post)
    if (!url) return
    browser.tabs.create({ active: true, url: url.toString() })
}

const key = 'openSNSAndActivatePlugin'
/**
 * This function will open a new web page, then open the composition dialog and activate the composition entry of the given plugin.
 * @param url URL to open
 * @param pluginID Plugin to activate
 */
export async function openSNSAndActivatePlugin(url: string, pluginID: string) {
    await browser.tabs.create({ active: true, url })
    sessionStorage.setItem(key, pluginID)
}
export async function getDesignatedAutoStartPluginID() {
    const val = sessionStorage.getItem(key)
    sessionStorage.removeItem(key)
    return val
}
